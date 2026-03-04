import { apiClient } from "./client";
import { ReportData } from "@/types/reports";

interface MonthlyReportApiItem {
  _id: string;
  year: number;
  month: number;
  status: "completed" | "processing" | "error";
  title: string;
  generatedAt: string;
  metrics: {
    revenue: number;
    totalClients: number;
    totalCheckIns: number;
    allowedCheckIns: number;
    deniedCheckIns: number;
    peakHour: {
      hour: number | null;
      label: string;
      count: number;
    };
    dailyAttendancePct: Array<{
      day: number;
      label: string;
      count: number;
      percentage: number;
    }>;
    recommendations?: string[];
    newClients: number;
    renewedMemberships: number;
    churnedClients: number;
    averageRevenuePerClient: number;
  };
}

interface MonthlyReportsResponse {
  reports: MonthlyReportApiItem[];
  range: { from: string; to: string };
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

export async function fetchReports(): Promise<ReportData[]> {
  const response = await apiClient<MonthlyReportsResponse>("/api/reports/monthly");

  return response.reports.map((report) => {
    const periodKey = getMonthKey(report.year, report.month);
    const periodLabel = getMonthLabel(report.year, report.month);

    return {
      id: report._id,
      type: "general",
      title: report.title || `Cierre mensual ${periodLabel}`,
      date: report.generatedAt,
      description: `Ingresos: $${report.metrics.revenue.toLocaleString()} · Check-ins: ${report.metrics.totalCheckIns.toLocaleString()}`,
      status: report.status,
      metadata: {
        totalRecords: report.metrics.totalClients,
        period: periodLabel,
        monthKey: periodKey,
        monthlyRevenue: report.metrics.revenue,
        totalCheckIns: report.metrics.totalCheckIns,
        allowedCheckIns: report.metrics.allowedCheckIns,
        deniedCheckIns: report.metrics.deniedCheckIns,
        peakHour: report.metrics.peakHour,
        dailyAttendancePct: report.metrics.dailyAttendancePct,
        recommendations: report.metrics.recommendations || [],
        newClients: report.metrics.newClients,
        renewedMemberships: report.metrics.renewedMemberships,
        churnedClients: report.metrics.churnedClients,
        averageRevenuePerClient: report.metrics.averageRevenuePerClient,
        _rawData: {
          year: report.year,
          month: report.month,
          period: periodLabel,
          revenue: report.metrics.revenue,
          totalClients: report.metrics.totalClients,
          totalCheckIns: report.metrics.totalCheckIns,
          allowedCheckIns: report.metrics.allowedCheckIns,
          deniedCheckIns: report.metrics.deniedCheckIns,
          peakHour: report.metrics.peakHour,
          dailyAttendancePct: report.metrics.dailyAttendancePct,
          recommendations: report.metrics.recommendations || [],
          newClients: report.metrics.newClients,
          renewedMemberships: report.metrics.renewedMemberships,
          churnedClients: report.metrics.churnedClients,
          averageRevenuePerClient: report.metrics.averageRevenuePerClient,
        },
      },
    } as ReportData;
  });
}

// ─── Generate CSV content from report data ──────────────────────

export function generateCSV(report: ReportData): string {
  const rawData = report.metadata?._rawData;
  if (!rawData) return "";

  // Handle array data (clients, staff, check-ins, etc.)
  if (Array.isArray(rawData)) {
    if (rawData.length === 0) return "";
    const headers = Object.keys(rawData[0]).filter(
      (k) => !k.startsWith("_") && k !== "__v",
    );
    const rows = rawData.map((item) =>
      headers.map((h) => {
        const val = item[h];
        if (val === null || val === undefined) return "";
        const str = String(val);
        // Escape CSV values that contain commas or quotes
        return str.includes(",") || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  }

  // Handle object data (stats, distribution, activity, etc.)
  if (typeof rawData === "object") {
    const entries = Object.entries(rawData).filter(
      ([k]) => !k.startsWith("_"),
    );
    const headers = entries.map(([k]) => k);
    const values = entries.map(([, v]) => {
      if (Array.isArray(v)) return v.length.toString();
      if (typeof v === "object" && v !== null) return JSON.stringify(v);
      return String(v ?? "");
    });
    return [headers.join(","), values.join(",")].join("\n");
  }

  return "";
}
