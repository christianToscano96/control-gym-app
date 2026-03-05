import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useSuperAdminAdminsInfiniteQuery,
  usePendingRegistrationsQuery,
  useSuperAdminSummaryQuery,
  useSuperAdminOverviewQuery,
} from "@/hooks/queries/useSuperAdmin";
import { AppState, AppStateStatus } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queries/queryKeys";

export const planConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  basico: { label: "Básico", color: "#6366F1", bg: "#EEF2FF" },
  pro: { label: "Pro", color: "#7C3AED", bg: "#F5F3FF" },
  proplus: { label: "Pro+", color: "#DB2777", bg: "#FDF2F8" },
};

export type FilterStatus = "active" | "inactive" | "pending";

export function useSuperAdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const isAppActive = appState === "active";
  const isAutoRefreshEnabled = isFocused && isAppActive;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useSuperAdminOverviewQuery({
      enabled: isFocused,
      refetchInterval: isAutoRefreshEnabled ? 15000 : false,
    });
  const {
    data: adminsPages,
    refetch: refetchAdmins,
    isFetching: isFetchingAdmins,
    dataUpdatedAt: adminsUpdatedAt,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuperAdminAdminsInfiniteQuery({
    enabled: isFocused,
    refetchInterval: isAutoRefreshEnabled ? 10000 : false,
    limit: 20,
    search: searchQuery,
    status: filterStatus,
  });
  const {
    data: summaryData,
    refetch: refetchSummary,
    isFetching: isFetchingSummary,
    dataUpdatedAt: summaryUpdatedAt,
  } = useSuperAdminSummaryQuery({
    enabled: isFocused,
    refetchInterval: isAutoRefreshEnabled ? 10000 : false,
  });
  const { data: pendingData, refetch: refetchPending } =
    usePendingRegistrationsQuery({
      enabled: isFocused,
      refetchInterval: isAutoRefreshEnabled ? 10000 : false,
    });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchSummary(), refetchAdmins(), refetchPending()]);
    setRefreshing(false);
  }, [refetch, refetchPending, refetchSummary, refetchAdmins]);

  useEffect(() => {
    if (!isFocused) return;
    if (appState === "active") {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
      });
      refetchSummary();
      refetchAdmins();
      refetchPending();
    }
  }, [appState, isFocused, queryClient, refetchAdmins, refetchPending, refetchSummary]);

  const baseAdmins = useMemo(
    () =>
      adminsPages?.pages?.flatMap((p) => p.admins || []) || data?.admins || [],
    [adminsPages?.pages, data?.admins],
  );

  const activeCount = useMemo(
    () =>
      baseAdmins.filter(
        (a) => a.gym?.active === true && a.gym?.onboardingStatus === "approved",
      ).length,
    [baseAdmins],
  );
  const inactiveCount = useMemo(
    () =>
      baseAdmins.filter(
        (a) => a.gym?.onboardingStatus === "approved" && !a.gym?.active,
      ).length,
    [baseAdmins],
  );
  const pendingCount = useMemo(
    () => baseAdmins.filter((a) => a.gym?.onboardingStatus === "pending").length,
    [baseAdmins],
  );

  const filteredAdmins = useMemo(() => baseAdmins, [baseAdmins]);

  const pendingAdmins = useMemo(() => {
    if (pendingData) return pendingData;
    return baseAdmins.filter((a) => a.gym?.onboardingStatus === "pending");
  }, [pendingData, baseAdmins]);

  const summary = summaryData || data?.summary;
  const resolvedCounts = {
    active: summary?.activeGyms ?? activeCount,
    inactive: summary?.inactiveGyms ?? inactiveCount,
    pending: summary?.pendingGyms ?? pendingCount,
  };

  const filterOptions: { key: FilterStatus; label: string; count?: number }[] =
    [
      { key: "active", label: "Activos", count: resolvedCounts.active },
      { key: "inactive", label: "Inactivos", count: resolvedCounts.inactive },
      {
        key: "pending",
        label: "Pendientes",
        count: resolvedCounts.pending,
      },
    ];

  return {
    refreshing,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    isLoading: isLoading && !adminsPages && !summaryData,
    isError,
    error,
    refetch,
    isFetching: isFetching || isFetchingSummary || isFetchingAdmins,
    isAutoRefreshEnabled,
    lastUpdatedAt: Math.max(
      dataUpdatedAt || 0,
      summaryUpdatedAt || 0,
      adminsUpdatedAt || 0,
    ),
    onRefresh,
    filteredAdmins,
    pendingAdmins,
    summary,
    filterOptions,
    loadMoreAdmins: () => {
      if (!hasNextPage || isFetchingNextPage) return;
      fetchNextPage();
    },
    hasMoreAdmins: Boolean(hasNextPage),
    isLoadingMoreAdmins: isFetchingNextPage,
    counts: resolvedCounts,
  };
}
