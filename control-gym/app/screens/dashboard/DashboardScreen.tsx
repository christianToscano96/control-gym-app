import { MaterialIcons } from "@expo/vector-icons";
import ActivityRateChart from "@/components/ui/ActivityRateChart";
import AttendanceChart from "@/components/ui/AttendanceChart";
import ExpiringMembershipsAlert from "@/components/ui/ExpiringMembershipsAlert";
import FAB from "@/components/ui/FAB";
import Header from "@/components/ui/Header";
import MembershipDistributionChart from "@/components/ui/MembershipDistributionChart";
import PeakHoursChart from "@/components/ui/PeakHoursChart";
import QuickActionsMenu from "@/components/ui/QuickActionsMenu";
import RecentCheckIns from "@/components/ui/RecentCheckIns";
import { RevenueCard } from "@/components/ui/RevenueCard";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import {
  useActivityRateQuery,
  useDashboardStatsQuery,
  useExpiringMembershipsQuery,
  useMembershipDistributionQuery,
  useWeeklyAttendanceQuery,
} from "@/hooks/queries/useDashboard";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { queryKeys } from "@/hooks/queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../../stores/store";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, primaryColor } = useTheme();
  const isStaff = user?.role === "empleado";
  const queryClient = useQueryClient();

  // ─── TanStack Query ──────────────────────────────────────────
  const { data: profile } = useProfileQuery();
  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useDashboardStatsQuery(!isStaff);
  const { data: weeklyData, refetch: refetchWeekly } =
    useWeeklyAttendanceQuery(!isStaff);
  const { data: activityData, refetch: refetchActivity } =
    useActivityRateQuery(!isStaff);
  const { data: membershipData, refetch: refetchMembership } =
    useMembershipDistributionQuery(!isStaff);
  const { data: expiringData, refetch: refetchExpiring } =
    useExpiringMembershipsQuery(!isStaff);

  // Sync profile avatar to Zustand store
  useEffect(() => {
    if (profile?.avatar && user?.token) {
      const avatarUrl = `${API_BASE_URL}${profile.avatar}`;
      if (user.avatar !== avatarUrl) {
        setUser({ ...user, avatar: avatarUrl }, user.token);
      }
    }
  }, [profile?.avatar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchWeekly(),
      refetchActivity(),
      refetchMembership(),
      refetchExpiring(),
      queryClient.invalidateQueries({ queryKey: queryKeys.access.recent }),
    ]);
    setRefreshing(false);
  }, [
    refetchStats,
    refetchWeekly,
    refetchActivity,
    refetchMembership,
    refetchExpiring,
    queryClient,
  ]);

  const handleActionPress = (action: string) => {
    if (action === "new-client") {
      router.push("/screens/clients/NewClientScreen");
    }
    if (action === "new-payment") {
      router.push("/screens/clients/RenewMembershipScreen");
    }
    if (action === "staff") {
      router.push("/screens/staff");
    }
    setIsMenuOpen(false);
  };

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
          {!isStaff && (
            <>
              {/* ─── Resumen ─── */}
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider px-2 mt-2 mb-1"
              >
                Resumen
              </Text>
              {/* Card de ingresos del mes - ancho completo */}
              <View className="px-2">
                <RevenueCard
                  value={`$${stats?.monthlyRevenue?.toLocaleString() || "0"}`}
                  percent={stats?.revenuePercent || "0%"}
                  loading={loadingStats}
                />
              </View>

              <View className="flex flex-row justify-between gap-4 p-2">
                <SummaryCard
                  icon="people"
                  title="CLIENTES"
                  value={
                    loadingStats ? "..." : stats?.totalClients.toString() || "0"
                  }
                  persent={loadingStats ? "..." : stats?.clientsPercent || "0%"}
                />
                <SummaryCard
                  icon="fitness-center"
                  title="INGRESOS HOY"
                  value={
                    loadingStats
                      ? "..."
                      : stats?.todayCheckIns.toString() || "0"
                  }
                  persent={
                    loadingStats ? "..." : stats?.checkInsPercent || "0%"
                  }
                />
              </View>

              {/* Card de rechazados - solo visible si hay rechazados */}
              {(stats?.todayDenied ?? 0) > 0 && (
                <View className="px-2 mb-1">
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#DC262630",
                      shadowColor: "#DC2626",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: "#DC262615",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialIcons name="block" size={20} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 22,
                          fontWeight: "800",
                          letterSpacing: -0.5,
                        }}
                      >
                        {stats?.todayDenied ?? 0}
                      </Text>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 11,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        RECHAZADOS HOY
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#FEE2E2",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#DC2626",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        Ingresos denegados
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {/* Alerta de membresías por vencer */}
              <ExpiringMembershipsAlert
                count={expiringData?.count ?? 0}
                onPress={() => router.push("/screens/clients" as any)}
              />
              {/* ─── Tendencias ─── */}
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-1"
              >
                Tendencias
              </Text>

              <AttendanceChart
                data={weeklyData?.weeklyAttendance || []}
                totalValue={weeklyData?.totalWeekly ?? 0}
                trendText={weeklyData?.trendPercent || "0% VS LA SEMANA PASADA"}
                highlightLabel={weeklyData?.highlightDay}
              />
              <PeakHoursChart data={stats?.peakHours || []} />
              <ActivityRateChart
                activeCount={activityData?.activeCount ?? 0}
                inactiveCount={activityData?.inactiveCount ?? 0}
                activityRate={activityData?.activityRate ?? 0}
              />
              <MembershipDistributionChart
                basico={membershipData?.basico ?? 0}
                pro={membershipData?.pro ?? 0}
                proplus={membershipData?.proplus ?? 0}
                total={membershipData?.total ?? 0}
              />
            </>
          )}

          {/* ─── Actividad ─── */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-1"
          >
            Actividad
          </Text>

          <RecentCheckIns />
        </ScrollView>
        <>
          <QuickActionsMenu
            visible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onActionPress={handleActionPress}
          />
        </>
      </View>
      <FAB isOpen={isMenuOpen} onPress={() => setIsMenuOpen(!isMenuOpen)} />
    </SafeAreaView>
  );
}
