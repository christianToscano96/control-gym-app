import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { API_BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar reportes");
      }

      const data = await response.json();
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
        const token = await AsyncStorage.getItem("token");
        const exportEndpoints: { [key: string]: string } = {
          clients: "/export/clients/csv",
          payments: "/export/payments/csv",
          attendance: "/export/attendance/csv",
          memberships: "/export/memberships/csv",
          revenue: "/export/revenue/csv",
          staff: "/export/staff/csv",
        };

        const endpoint = exportEndpoints[reportType] || "/export/report/pdf";
        const url = `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al exportar el reporte");
        }

        return response.blob();
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
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/reports/generate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, ...params }),
        });

        if (!response.ok) {
          throw new Error("Error al generar el reporte");
        }

        const newReport = await response.json();
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
