import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, Share, Platform } from "react-native";
import * as Print from "expo-print";
import { fetchReports, generateCSV } from "@/api/reports";
import { generateReportHTML } from "@/utils/pdfTemplates";
import { queryKeys } from "./queryKeys";
import { ReportData, ReportFilters, ExportFormat } from "@/types/reports";

// ─── Query: Fetch Reports ───────────────────────────────────────
export function useReportsQuery(filters?: ReportFilters) {
  return useQuery<ReportData[]>({
    queryKey: queryKeys.reports.all,
    queryFn: () => fetchReports(),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

// ─── Mutation: Export Report ────────────────────────────────────
export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      report,
      format = "csv",
    }: {
      report: ReportData;
      format?: ExportFormat;
    }) => {
      if (format === "pdf") {
        return exportAsPDF(report);
      }
      return exportAsCSV(report);
    },
    onError: (error: Error) => {
      Alert.alert(
        "Error al exportar",
        error.message ||
          "No se pudo exportar el reporte. Intenta nuevamente.",
      );
    },
  });
}

// ─── PDF Export (expo-print → Share) ────────────────────────────
async function exportAsPDF(report: ReportData) {
  const html = generateReportHTML(report);

  // Generate PDF file from HTML
  const { uri } = await Print.printToFileAsync({ html });

  // Share the PDF file
  if (Platform.OS === "ios") {
    await Share.share({ url: uri });
  } else {
    await Share.share({
      message: `Reporte: ${report.title}`,
      title: report.title,
    });
  }

  return { uri, format: "pdf" as const };
}

// ─── CSV Export (Share as text) ──────────────────────────────────
async function exportAsCSV(report: ReportData) {
  const csvContent = generateCSV(report);

  if (!csvContent) {
    throw new Error("No hay datos para exportar en este reporte");
  }

  await Share.share(
    {
      message: csvContent,
      title: `${report.title}.csv`,
    },
    {
      subject: `${report.title} - Reporte`,
      ...(Platform.OS === "ios" ? {} : { dialogTitle: "Exportar reporte" }),
    },
  );

  return { format: "csv" as const };
}
