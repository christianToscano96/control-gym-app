import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { ReportData } from "@/components/ui/ReportCard";
import { queryKeys } from "./queryKeys";

// ─── Queries ─────────────────────────────────────────────────────

export function useReportsQuery() {
  return useQuery<ReportData[]>({
    queryKey: queryKeys.reports.all,
    queryFn: () => apiClient<ReportData[]>("/reports"),
  });
}

// ─── Mutations ───────────────────────────────────────────────────

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, params }: { type: string; params?: Record<string, any> }) =>
      apiClient<ReportData>("/reports/generate", {
        method: "POST",
        body: { type, ...params },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      reportType,
    }: {
      reportId: string;
      reportType: string;
    }) => {
      const exportEndpoints: Record<string, string> = {
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
    },
  });
}
