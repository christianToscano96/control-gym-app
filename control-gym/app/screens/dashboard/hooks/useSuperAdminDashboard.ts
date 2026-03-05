import { useState, useMemo, useCallback } from "react";
import { useSuperAdminOverviewQuery } from "@/hooks/queries/useSuperAdmin";

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

  const { data, isLoading, isError, error, refetch } =
    useSuperAdminOverviewQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredAdmins = useMemo(() => {
    if (!data?.admins) return [];
    let filtered = [...data.admins];

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
  }, [data?.admins, searchQuery, filterStatus]);

  const pendingAdmins = useMemo(() => {
    if (!data?.admins) return [];
    return data.admins.filter((a) => a.gym?.onboardingStatus === "pending");
  }, [data?.admins]);

  const summary = data?.summary;

  const filterOptions: { key: FilterStatus; label: string; count?: number }[] =
    [
      { key: "all", label: "Todos", count: data?.admins?.length },
      { key: "active", label: "Activos", count: summary?.activeGyms },
      { key: "inactive", label: "Inactivos", count: summary?.inactiveGyms },
      { key: "pending", label: "Pendientes", count: summary?.pendingGyms },
    ];

  return {
    refreshing,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    isLoading,
    isError,
    error,
    refetch,
    onRefresh,
    filteredAdmins,
    pendingAdmins,
    summary,
    filterOptions,
  };
}
