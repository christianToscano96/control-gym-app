import React from "react";
import { View, ScrollView, RefreshControl, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import Header from "@/components/ui/Header";
import SearchInput from "@/components/ui/SearchInput";
import { useSuperAdminDashboard } from "./hooks/useSuperAdminDashboard";
import { RevenueCard } from "./components/RevenueCard";
import { StatCard } from "./components/StatCard";
import { PlanDistribution } from "./components/PlanDistribution";
import { FilterChips } from "./components/FilterChips";
import { GymAdminList } from "./components/GymAdminList";

export default function SuperAdminDashboard() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const { colors, primaryColor } = useTheme();

  const {
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
    summary,
    filterOptions,
  } = useSuperAdminDashboard();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <View className="px-4 mt-4">
        <Header username={user?.name} avatarUrl={user?.avatar} />
        <ScrollView
          className="my-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
        >
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-wider px-2 mt-2 mb-1"
          >
            Panel Super Admin
          </Text>

          <RevenueCard
            isLoading={isLoading}
            totalRevenue={summary?.totalGymRevenue ?? 0}
            platformRevenue={summary?.totalPlatformRevenue ?? 0}
          />

          <View className="flex-row gap-3 px-1 my-2">
            <StatCard
              icon="store"
              label="GIMNASIOS"
              value={isLoading ? "..." : String(summary?.totalGyms ?? 0)}
              subtitle={`${summary?.activeGyms ?? 0} activos`}
              accentColor={primaryColor}
            />
            <StatCard
              icon="people"
              label="CLIENTES"
              value={isLoading ? "..." : String(summary?.totalClients ?? 0)}
              subtitle={`${summary?.totalGyms ? Math.round(summary.totalClients / summary.totalGyms) : 0} prom/gym`}
              accentColor="#6366F1"
            />
          </View>

          <PlanDistribution
            isLoading={isLoading}
            planDistribution={summary?.planDistribution}
          />

          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar gimnasio o admin..."
            onClear={() => setSearchQuery("")}
          />

          <FilterChips
            filterStatus={filterStatus}
            filterOptions={filterOptions}
            onFilterChange={setFilterStatus}
          />

          <GymAdminList
            isLoading={isLoading}
            isError={isError}
            error={error}
            filteredAdmins={filteredAdmins}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onRetry={() => refetch()}
            onAdminPress={(admin) => {
              if (admin.gym) {
                router.push({
                  pathname: "/screens/superadmin/gym-detail",
                  params: { gymId: admin.gym._id },
                } as any);
              }
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
