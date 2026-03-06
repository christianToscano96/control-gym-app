import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, DashboardStats, getRecentCheckIns, RecentCheckIn, getWeeklyAttendance, WeeklyAttendance, getActivityRate, ActivityRateData, getMembershipDistribution, MembershipDistribution, getExpiringMemberships, ExpiringMemberships, getGymSubscription, GymSubscription } from "@/api/dashboard";
import { queryKeys } from "./queryKeys";

interface QueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

const DASHBOARD_REFETCH_INTERVAL = 15_000;

export function useDashboardStatsQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = DASHBOARD_REFETCH_INTERVAL } = options;
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: getDashboardStats,
    enabled,
    staleTime: 10_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useRecentCheckInsQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = DASHBOARD_REFETCH_INTERVAL } = options;
  return useQuery<RecentCheckIn[]>({
    queryKey: queryKeys.access.recent,
    queryFn: getRecentCheckIns,
    staleTime: 10_000,
    refetchInterval,
    enabled,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useWeeklyAttendanceQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = DASHBOARD_REFETCH_INTERVAL } = options;
  return useQuery<WeeklyAttendance>({
    queryKey: queryKeys.dashboard.weeklyAttendance,
    queryFn: getWeeklyAttendance,
    enabled,
    staleTime: 10_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useActivityRateQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = DASHBOARD_REFETCH_INTERVAL } = options;
  return useQuery<ActivityRateData>({
    queryKey: queryKeys.dashboard.activityRate,
    queryFn: getActivityRate,
    enabled,
    staleTime: 10_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useMembershipDistributionQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = DASHBOARD_REFETCH_INTERVAL } = options;
  return useQuery<MembershipDistribution>({
    queryKey: queryKeys.dashboard.membershipDistribution,
    queryFn: getMembershipDistribution,
    enabled,
    staleTime: 10_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useExpiringMembershipsQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = 60_000 } = options;
  return useQuery<ExpiringMemberships>({
    queryKey: queryKeys.dashboard.expiringMemberships,
    queryFn: getExpiringMemberships,
    enabled,
    staleTime: 30_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useGymSubscriptionQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = 60_000 } = options;
  return useQuery<GymSubscription | null>({
    queryKey: queryKeys.gymSubscription.active,
    queryFn: getGymSubscription,
    enabled,
    staleTime: 30_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
