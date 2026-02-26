import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, DashboardStats, getRecentCheckIns, RecentCheckIn, getWeeklyAttendance, WeeklyAttendance, getActivityRate, ActivityRateData } from "@/api/dashboard";
import { queryKeys } from "./queryKeys";

export function useDashboardStatsQuery(enabled: boolean = true) {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: getDashboardStats,
    enabled,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useRecentCheckInsQuery() {
  return useQuery<RecentCheckIn[]>({
    queryKey: queryKeys.access.recent,
    queryFn: getRecentCheckIns,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useWeeklyAttendanceQuery(enabled: boolean = true) {
  return useQuery<WeeklyAttendance>({
    queryKey: queryKeys.dashboard.weeklyAttendance,
    queryFn: getWeeklyAttendance,
    enabled,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useActivityRateQuery(enabled: boolean = true) {
  return useQuery<ActivityRateData>({
    queryKey: queryKeys.dashboard.activityRate,
    queryFn: getActivityRate,
    enabled,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
