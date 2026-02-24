import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { apiClient } from "@/api/client";
import { ReportData } from "@/components/ui/ReportCard";

export interface ReportFilters {
  searchQuery?: string;
  reportType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  statusFilter?: string;
}

export const useReports = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<ReportData[]>("/reports");
      setReports(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching reports:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const filterReports = useCallback(
    (filters: ReportFilters): ReportData[] => {
      let filtered = [...reports];

      if (filters.searchQuery?.trim()) {
        filtered = filtered.filter(
          (report) =>
            report.title
              .toLowerCase()
              .includes(filters.searchQuery!.toLowerCase()) ||
            report.description
              ?.toLowerCase()
              .includes(filters.searchQuery!.toLowerCase()),
        );
      }

      if (filters.reportType) {
        filtered = filtered.filter(
          (report) => report.type === filters.reportType,
        );
      }

      if (filters.statusFilter) {
        filtered = filtered.filter(
          (report) => report.status === filters.statusFilter,
        );
      }

      if (filters.startDate) {
        filtered = filtered.filter(
          (report) => new Date(report.date) >= filters.startDate!,
        );
      }

      if (filters.endDate) {
        filtered = filtered.filter(
          (report) => new Date(report.date) <= filters.endDate!,
        );
      }

      return filtered;
    },
    [reports],
  );

  const exportReport = useCallback(
    async (reportId: string, reportType: string) => {
      try {
        const exportEndpoints: { [key: string]: string } = {
          clients: "/export/clients/csv",
          payments: "/export/payments/csv",
          attendance: "/export/attendance/csv",
          memberships: "/export/memberships/csv",
          revenue: "/export/revenue/csv",
          staff: "/export/staff/csv",
        };

        const endpoint = exportEndpoints[reportType] || "/export/report/pdf";
        const response = await apiClient<Response>(endpoint);
        return (response as unknown as Response).blob();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al exportar";
        Alert.alert("Error", errorMessage);
        throw err;
      }
    },
    [],
  );

  const generateReport = useCallback(
    async (type: string, params?: Record<string, any>) => {
      setLoading(true);
      try {
        const newReport = await apiClient<ReportData>("/reports/generate", {
          method: "POST",
          body: { type, ...params },
        });
        setReports((prev) => [newReport, ...prev]);
        return newReport;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al generar reporte";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    reports,
    loading,
    error,
    fetchReports,
    filterReports,
    exportReport,
    generateReport,
  };
};
