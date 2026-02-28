import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Share, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { fetchReports, generateCSV } from "@/api/reports";
import { queryKeys } from "./queryKeys";
import { ReportData, ReportFilters, ExportFormat } from "@/types/reports";

// Lazy import expo-sharing (may not be available in Expo Go)
let Sharing: typeof import("expo-sharing") | null = null;
try {
  Sharing = require("expo-sharing");
} catch {
  Sharing = null;
}

// ─── Query: Fetch Reports ───────────────────────────────────────
export function useReportsQuery(filters?: ReportFilters) {
  return useQuery<ReportData[]>({
    queryKey: queryKeys.reports.all,
    queryFn: () => fetchReports(),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

// ─── Mutation: Refresh all reports ──────────────────────────────
export function useRefreshReports() {
  const queryClient = useQueryClient();

  return {
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
  };
}

// ─── Helper: share a file ───────────────────────────────────────
async function shareFile(fileUri: string, mimeType: string) {
  if (Sharing) {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: "Exportar reporte",
        });
        return;
      }
    } catch {
      // Fall through to RN Share
    }
  }

  // Fallback: React Native Share API
  if (Platform.OS === "ios") {
    await Share.share({ url: fileUri });
  } else {
    await Share.share({
      message: `Reporte descargado: ${fileUri}`,
      title: "Exportar reporte",
    });
  }
}

// ─── Mutation: Export Report (generate CSV client-side) ──────────
export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      report,
      format = "csv",
    }: {
      report: ReportData;
      format?: ExportFormat;
    }) => {
      // Generate CSV content from the report's raw data
      const csvContent = generateCSV(report);

      if (!csvContent) {
        throw new Error("No hay datos para exportar en este reporte");
      }

      // Write CSV to local file
      const filename = `${report.type}_${report.id}_${Date.now()}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      await shareFile(fileUri, "text/csv");

      return { uri: fileUri, filename };
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
