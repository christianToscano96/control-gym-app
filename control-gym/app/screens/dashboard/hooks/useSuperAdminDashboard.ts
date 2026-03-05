import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useSuperAdminAdminsQuery,
  usePendingRegistrationsQuery,
  useSuperAdminSummaryQuery,
  useSuperAdminOverviewQuery,
} from "@/hooks/queries/useSuperAdmin";
import { AppState, AppStateStatus } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export const planConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  basico: { label: "Básico", color: "#6366F1", bg: "#EEF2FF" },
  pro: { label: "Pro", color: "#7C3AED", bg: "#F5F3FF" },
  proplus: { label: "Pro+", color: "#DB2777", bg: "#FDF2F8" },
};

export type FilterStatus = "all" | "active" | "inactive" | "pending";

export function useSuperAdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
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
    data: adminsData,
    refetch: refetchAdmins,
    isFetching: isFetchingAdmins,
    dataUpdatedAt: adminsUpdatedAt,
  } = useSuperAdminAdminsQuery({
    enabled: isFocused,
    refetchInterval: isAutoRefreshEnabled ? 10000 : false,
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

  const filteredAdmins = useMemo(() => {
    const baseAdmins = adminsData || data?.admins || [];
    if (!baseAdmins.length) return [];
    let filtered = [...baseAdmins];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.gym?.name.toLowerCase().includes(q),
      );
    }

    if (filterStatus === "active") {
      filtered = filtered.filter(
        (a) => a.gym?.active === true && a.gym?.onboardingStatus === "approved",
      );
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(
        (a) => a.gym?.onboardingStatus === "approved" && !a.gym?.active,
      );
    } else if (filterStatus === "pending") {
      filtered = filtered.filter((a) => a.gym?.onboardingStatus === "pending");
    }

    return filtered;
  }, [adminsData, data?.admins, searchQuery, filterStatus]);

  const pendingAdmins = useMemo(() => {
    if (pendingData) return pendingData;
    const baseAdmins = adminsData || data?.admins || [];
    return baseAdmins.filter((a) => a.gym?.onboardingStatus === "pending");
  }, [pendingData, adminsData, data?.admins]);

  const summary = summaryData || data?.summary;

  const filterOptions: { key: FilterStatus; label: string; count?: number }[] =
    [
      { key: "all", label: "Todos", count: (adminsData || data?.admins || []).length },
      { key: "active", label: "Activos", count: summary?.activeGyms },
      { key: "inactive", label: "Inactivos", count: summary?.inactiveGyms },
      {
        key: "pending",
        label: "Pendientes",
        count: pendingAdmins.length || summary?.pendingGyms,
      },
    ];

  return {
    refreshing,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    isLoading: isLoading && !adminsData && !summaryData,
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
  };
}
