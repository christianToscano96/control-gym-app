import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, DashboardStats } from "@/api/dashboard";
import { getRecentCheckIns, RecentCheckIn } from "@/api/dashboard";
import { queryKeys } from "./queryKeys";

export function useDashboardStatsQuery(enabled: boolean = true) {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: getDashboardStats,
    enabled,
  });
}

export function useRecentCheckInsQuery() {
  return useQuery<RecentCheckIn[]>({
    queryKey: queryKeys.access.recent,
    queryFn: getRecentCheckIns,
  });
}
