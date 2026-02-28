import { apiClient } from "./client";
import {
  getDashboardStats,
  getWeeklyAttendance,
  getActivityRate,
  getMembershipDistribution,
  getExpiringMemberships,
  getRecentCheckIns,
} from "./dashboard";
import { fetchClients } from "./clients";
import { fetchStaff } from "./staff";
import { ReportData } from "@/types/reports";

// ─── Build reports dynamically from existing API endpoints ──────

export async function fetchReports(): Promise<ReportData[]> {
  const today = new Date().toISOString().split("T")[0];
  const reports: ReportData[] = [];

  // Fetch all data sources in parallel
  const results = await Promise.allSettled([
    getDashboardStats(),
    fetchClients(),
    getWeeklyAttendance(),
    getActivityRate(),
    getMembershipDistribution(),
    getExpiringMemberships(),
    getRecentCheckIns(),
    fetchStaff(),
  ]);

  const [
    statsResult,
    clientsResult,
    attendanceResult,
    activityResult,
    membershipResult,
    expiringResult,
    checkInsResult,
    staffResult,
  ] = results;

  // 1. Clients report
  if (clientsResult.status === "fulfilled") {
    const clients = clientsResult.value as any[];
    reports.push({
      id: "report-clients",
      type: "clients",
      title: "Reporte de Clientes",
      date: today,
      description: "Listado completo de clientes registrados",
      status: "completed",
      metadata: {
        totalRecords: clients.length,
        period: "Actual",
        _rawData: clients,
      },
    });
  }

  // 2. Revenue report (from dashboard stats)
  if (statsResult.status === "fulfilled") {
    const stats = statsResult.value;
    reports.push({
      id: "report-revenue",
      type: "revenue",
      title: "Reporte de Ingresos",
      date: today,
      description: `Ingresos mensuales: $${stats.monthlyRevenue.toLocaleString()}`,
      status: "completed",
      metadata: {
        totalRecords: stats.totalClients,
        period: "Este mes",
        monthlyRevenue: stats.monthlyRevenue,
        revenuePercent: stats.revenuePercent,
        todayCheckIns: stats.todayCheckIns,
        todayDenied: stats.todayDenied,
        _rawData: stats,
      },
    });
  }

  // 3. Attendance report
  if (attendanceResult.status === "fulfilled") {
    const attendance = attendanceResult.value;
    reports.push({
      id: "report-attendance",
      type: "attendance",
      title: "Reporte de Asistencias",
      date: today,
      description: `${attendance.totalWeekly} asistencias esta semana (${attendance.trendPercent})`,
      status: "completed",
      metadata: {
        totalRecords: attendance.totalWeekly,
        period: "Esta semana",
        trendPercent: attendance.trendPercent,
        highlightDay: attendance.highlightDay,
        _rawData: attendance,
      },
    });
  }

  // 4. Check-ins report (recent access)
  if (checkInsResult.status === "fulfilled") {
    const checkIns = checkInsResult.value;
    const allowed = checkIns.filter((c) => c.status === "allowed").length;
    const denied = checkIns.filter((c) => c.status === "denied").length;
    reports.push({
      id: "report-checkins",
      type: "attendance",
      title: "Registro de Accesos",
      date: today,
      description: `${allowed} permitidos, ${denied} denegados`,
      status: "completed",
      metadata: {
        totalRecords: checkIns.length,
        period: "Recientes",
        allowed,
        denied,
        _rawData: checkIns,
      },
    });
  }

  // 5. Memberships report
  if (membershipResult.status === "fulfilled") {
    const dist = membershipResult.value;
    reports.push({
      id: "report-memberships",
      type: "memberships",
      title: "Reporte de Membresías",
      date: today,
      description: `Basico: ${dist.basico}, Pro: ${dist.pro}, Pro+: ${dist.proplus}`,
      status: "completed",
      metadata: {
        totalRecords: dist.total,
        period: "Activas",
        basico: dist.basico,
        pro: dist.pro,
        proplus: dist.proplus,
        _rawData: dist,
      },
    });
  }

  // 6. Expiring memberships report
  if (expiringResult.status === "fulfilled") {
    const expiring = expiringResult.value;
    reports.push({
      id: "report-expiring",
      type: "memberships",
      title: "Membresías por Vencer",
      date: today,
      description: `${expiring.count} membresías proximas a vencer`,
      status: expiring.count > 0 ? "completed" : "pending",
      metadata: {
        totalRecords: expiring.count,
        period: "Proximas",
        _rawData: expiring,
      },
    });
  }

  // 7. Activity rate report
  if (activityResult.status === "fulfilled") {
    const activity = activityResult.value;
    reports.push({
      id: "report-activity",
      type: "clients",
      title: "Tasa de Actividad",
      date: today,
      description: `${activity.activityRate}% activos (${activity.activeCount} activos, ${activity.inactiveCount} inactivos)`,
      status: "completed",
      metadata: {
        totalRecords: activity.activeCount + activity.inactiveCount,
        period: "Actual",
        activityRate: activity.activityRate,
        _rawData: activity,
      },
    });
  }

  // 8. Staff report
  if (staffResult.status === "fulfilled") {
    const staff = staffResult.value as any[];
    reports.push({
      id: "report-staff",
      type: "staff",
      title: "Reporte de Personal",
      date: today,
      description: "Listado de empleados del gimnasio",
      status: "completed",
      metadata: {
        totalRecords: staff.length,
        period: "Actual",
        _rawData: staff,
      },
    });
  }

  // 9. Peak hours report (from dashboard stats)
  if (statsResult.status === "fulfilled" && statsResult.value.peakHours?.length > 0) {
    const stats = statsResult.value;
    const topHour = stats.peakHours.reduce((max, h) =>
      h.value > max.value ? h : max,
    );
    reports.push({
      id: "report-peak-hours",
      type: "peak_hour",
      title: "Reporte Horas Pico",
      date: today,
      description: `Hora mas concurrida: ${topHour.label} (${topHour.value} visitas)`,
      status: "completed",
      metadata: {
        totalRecords: stats.peakHours.length,
        period: "Hoy",
        _rawData: stats.peakHours,
      },
    });
  }

  return reports;
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
