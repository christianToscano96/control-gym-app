import { MaterialIcons } from "@expo/vector-icons";
import ActivityRateChart from "@/components/ui/ActivityRateChart";
import AttendanceChart from "@/components/ui/AttendanceChart";
import ExpiringMembershipsAlert from "@/components/ui/ExpiringMembershipsAlert";
import GymSubscriptionAlert from "@/components/ui/GymSubscriptionAlert";
import InactiveClientsAlert from "@/components/ui/InactiveClientsAlert";
import FAB from "@/components/ui/FAB";
import Header from "@/components/ui/Header";
//import MembershipDistributionChart from "@/components/ui/MembershipDistributionChart";
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
  useGymSubscriptionQuery,
  useWeeklyAttendanceQuery,
} from "@/hooks/queries/useDashboard";
import { useClientsQuery } from "@/hooks/queries/useClients";
import {
  useCloseCashRegisterMutation,
  useCashClosureHistoryQuery,
  useTodayCashSummaryQuery,
} from "@/hooks/queries/useCashClosure";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { queryKeys } from "@/hooks/queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../../stores/store";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState("");
  const [cashNotes, setCashNotes] = useState("");
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
  //const { data: membershipData, refetch: refetchMembership } =
  //useMembershipDistributionQuery(!isStaff);
  const { data: expiringData, refetch: refetchExpiring } =
    useExpiringMembershipsQuery(!isStaff);
  const { data: gymSubscription, refetch: refetchSubscription } =
    useGymSubscriptionQuery(!isStaff);
  const { data: clients = [], refetch: refetchClients } =
    useClientsQuery(!isStaff);
  const {
    data: cashSummary,
    isFetching: fetchingCashSummary,
    refetch: refetchCashSummary,
  } = useTodayCashSummaryQuery(Boolean(user?.gymId));
  const { data: cashHistory = [], refetch: refetchCashHistory } =
    useCashClosureHistoryQuery(7, Boolean(user?.gymId));
  const closeCashMutation = useCloseCashRegisterMutation();

  // Calculate days left for gym subscription
  const subscriptionDaysLeft = gymSubscription?.endDate
    ? Math.ceil(
        (new Date(gymSubscription.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Sync profile avatar to Zustand store
  useEffect(() => {
    if (profile?.avatar && user?.token) {
      const avatarUrl = `${API_BASE_URL}${profile.avatar}`;
      if (user.avatar !== avatarUrl) {
        setUser({ ...user, avatar: avatarUrl }, user.token);
      }
    }
  }, [profile?.avatar, setUser, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchWeekly(),
      refetchActivity(),
      //refetchMembership(),
      refetchExpiring(),
      refetchSubscription(),
      refetchClients(),
      refetchCashSummary(),
      refetchCashHistory(),
      queryClient.invalidateQueries({ queryKey: queryKeys.access.recent }),
    ]);
    setRefreshing(false);
  }, [
    refetchStats,
    refetchWeekly,
    refetchActivity,
    //refetchMembership,
    refetchExpiring,
    refetchSubscription,
    refetchClients,
    refetchCashSummary,
    refetchCashHistory,
    queryClient,
  ]);

  const lastClosed = cashHistory[0];
  const previousClosed = cashHistory[1];
  const closureDeltaVsPrevious =
    lastClosed && previousClosed
      ? lastClosed.breakdown.total - previousClosed.breakdown.total
      : 0;

  const openCashClosureModal = () => {
    setCountedCashInput(String(cashSummary?.expectedCash ?? 0));
    setCashNotes(cashSummary?.closure?.notes || "");
    setIsCashModalOpen(true);
  };

  const closeCashModal = () => {
    if (closeCashMutation.isPending) return;
    setIsCashModalOpen(false);
  };

  const handleConfirmCashClosure = async () => {
    const parsedCountedCash = Number(
      countedCashInput.replace(/\./g, "").replace(",", "."),
    );
    if (!Number.isFinite(parsedCountedCash) || parsedCountedCash < 0) {
      Alert.alert(
        "Monto inválido",
        "Ingresa un valor numérico válido para efectivo contado.",
      );
      return;
    }

    try {
      await closeCashMutation.mutateAsync({
        countedCash: parsedCountedCash,
        notes: cashNotes.trim(),
      });
      Alert.alert("Caja cerrada", "El cierre del día se guardó correctamente.");
      setIsCashModalOpen(false);
    } catch (error: any) {
      Alert.alert(
        "No se pudo cerrar la caja",
        error?.message || "Ocurrió un error inesperado.",
      );
    }
  };

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
          {/* Alerta de suscripción del gimnasio por vencer */}
          {!isStaff &&
            subscriptionDaysLeft !== null &&
            subscriptionDaysLeft <= 7 &&
            gymSubscription && (
              <GymSubscriptionAlert
                daysLeft={subscriptionDaysLeft}
                endDate={gymSubscription.endDate}
                plan={gymSubscription.plan}
                onPress={() => router.push("/membership" as any)}
              />
            )}

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
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginHorizontal: 6,
                  marginTop: 8,
                }}
              >
                <ExpiringMembershipsAlert
                  count={expiringData?.count ?? 0}
                  expiringData={expiringData}
                  compact
                />
                <InactiveClientsAlert clients={clients} compact />
              </View>

              <View className="px-2 mt-3">
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 14,
                        fontWeight: "800",
                      }}
                    >
                      Cierre de caja
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            "/screens/dashboard/cash-closure-history" as any,
                          )
                        }
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: colors.textSecondary,
                          }}
                        >
                          Historial
                        </Text>
                      </TouchableOpacity>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor:
                            cashSummary?.status === "closed"
                              ? "#DCFCE7"
                              : "#FEF3C7",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color:
                              cashSummary?.status === "closed"
                                ? "#166534"
                                : "#92400E",
                          }}
                        >
                          {cashSummary?.status === "closed"
                            ? "CERRADA"
                            : "ABIERTA"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Efectivo esperado: $
                    {(cashSummary?.expectedCash ?? 0).toLocaleString("es-AR")}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Efectivo: $
                    {(cashSummary?.breakdown?.cash ?? 0).toLocaleString(
                      "es-AR",
                    )}{" "}
                    · Transferencia: $
                    {(cashSummary?.breakdown?.transfer ?? 0).toLocaleString(
                      "es-AR",
                    )}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Tarjeta: $
                    {(cashSummary?.breakdown?.card ?? 0).toLocaleString(
                      "es-AR",
                    )}{" "}
                    · Otros: $
                    {(cashSummary?.breakdown?.other ?? 0).toLocaleString(
                      "es-AR",
                    )}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Total del día: $
                    {(cashSummary?.breakdown?.total ?? 0).toLocaleString(
                      "es-AR",
                    )}
                  </Text>

                  {cashSummary?.status === "closed" && (
                    <Text
                      style={{
                        color:
                          (cashSummary?.closure?.difference ?? 0) >= 0
                            ? "#15803D"
                            : "#DC2626",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      Diferencia registrada: $
                      {(cashSummary?.closure?.difference ?? 0).toLocaleString(
                        "es-AR",
                      )}
                    </Text>
                  )}

                  <TouchableOpacity
                    disabled={
                      fetchingCashSummary || closeCashMutation.isPending
                    }
                    onPress={openCashClosureModal}
                    style={{
                      marginTop: 4,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: primaryColor,
                      paddingVertical: 10,
                      alignItems: "center",
                      backgroundColor: `${primaryColor}18`,
                      opacity:
                        fetchingCashSummary || closeCashMutation.isPending
                          ? 0.7
                          : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: primaryColor,
                        fontWeight: "800",
                        fontSize: 12,
                      }}
                    >
                      {cashSummary?.status === "closed"
                        ? "Editar cierre de hoy"
                        : "Cerrar caja del día"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="px-2 mt-2">
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 13,
                      fontWeight: "800",
                    }}
                  >
                    Historial y comparativa
                  </Text>

                  <View
                    style={{
                      borderRadius: 10,
                      backgroundColor: `${primaryColor}12`,
                      padding: 10,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                      Último cierre vs anterior
                    </Text>
                    <Text
                      style={{
                        color:
                          closureDeltaVsPrevious >= 0 ? "#15803D" : "#DC2626",
                        fontSize: 16,
                        fontWeight: "800",
                        marginTop: 2,
                      }}
                    >
                      {closureDeltaVsPrevious >= 0 ? "+" : ""}$
                      {Math.abs(closureDeltaVsPrevious).toLocaleString("es-AR")}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                      {lastClosed && previousClosed
                        ? `${lastClosed.dateKey} vs ${previousClosed.dateKey}`
                        : "Aún no hay suficientes cierres para comparar"}
                    </Text>
                  </View>

                  {cashHistory.slice(0, 4).map((item) => (
                    <View
                      key={item._id}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          {item.dateKey}
                        </Text>
                        <Text
                          style={{ color: colors.textSecondary, fontSize: 11 }}
                        >
                          Esperado: ${item.expectedCash.toLocaleString("es-AR")}{" "}
                          · Contado: ${item.countedCash.toLocaleString("es-AR")}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: item.difference >= 0 ? "#15803D" : "#DC2626",
                          fontSize: 12,
                          fontWeight: "800",
                        }}
                      >
                        {item.difference >= 0 ? "+" : ""}$
                        {Math.abs(item.difference).toLocaleString("es-AR")}
                      </Text>
                    </View>
                  ))}

                  {cashHistory.length === 0 && (
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      Todavía no hay cierres registrados.
                    </Text>
                  )}
                </View>
              </View>
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
              {/* Distribución de membresías 
               <MembershipDistributionChart
                basico={membershipData?.basico ?? 0}
                pro={membershipData?.pro ?? 0}
                proplus={membershipData?.proplus ?? 0}
                total={membershipData?.total ?? 0}
              />
              */}
            </>
          )}

          {isStaff && (
            <View className="px-2 mt-2">
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    Cierre de caja
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push("/screens/dashboard/cash-closure-history" as any)
                    }
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: colors.textSecondary,
                      }}
                    >
                      Historial
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Efectivo esperado: $
                  {(cashSummary?.expectedCash ?? 0).toLocaleString("es-AR")}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Total del día: $
                  {(cashSummary?.breakdown?.total ?? 0).toLocaleString("es-AR")}
                </Text>
                {cashSummary?.status === "closed" && (
                  <Text
                    style={{
                      color:
                        (cashSummary?.closure?.difference ?? 0) >= 0
                          ? "#15803D"
                          : "#DC2626",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Diferencia registrada: $
                    {(cashSummary?.closure?.difference ?? 0).toLocaleString("es-AR")}
                  </Text>
                )}

                <TouchableOpacity
                  disabled={fetchingCashSummary || closeCashMutation.isPending}
                  onPress={openCashClosureModal}
                  style={{
                    marginTop: 4,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: primaryColor,
                    paddingVertical: 10,
                    alignItems: "center",
                    backgroundColor: `${primaryColor}18`,
                    opacity:
                      fetchingCashSummary || closeCashMutation.isPending ? 0.7 : 1,
                  }}
                >
                  <Text
                    style={{ color: primaryColor, fontWeight: "800", fontSize: 12 }}
                  >
                    {cashSummary?.status === "closed"
                      ? "Editar cierre de hoy"
                      : "Cerrar caja del día"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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

      <Modal
        visible={isCashModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCashModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}
            >
              Cierre de caja
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 4,
                marginBottom: 10,
              }}
            >
              Ingrese el efectivo contado al cierre del día.
            </Text>

            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Efectivo esperado
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 10,
              }}
            >
              ${(cashSummary?.expectedCash ?? 0).toLocaleString("es-AR")}
            </Text>

            <TextInput
              value={countedCashInput}
              onChangeText={setCountedCashInput}
              keyboardType="numeric"
              placeholder="Efectivo contado"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                marginBottom: 10,
              }}
            />

            <TextInput
              value={cashNotes}
              onChangeText={setCashNotes}
              placeholder="Observaciones (opcional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 86,
                color: colors.text,
                textAlignVertical: "top",
              }}
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <TouchableOpacity
                onPress={closeCashModal}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{ color: colors.textSecondary, fontWeight: "700" }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmCashClosure}
                disabled={closeCashMutation.isPending}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  backgroundColor: primaryColor,
                  alignItems: "center",
                  paddingVertical: 10,
                  opacity: closeCashMutation.isPending ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "#0d1c3d", fontWeight: "800" }}>
                  {closeCashMutation.isPending ? "Guardando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FAB isOpen={isMenuOpen} onPress={() => setIsMenuOpen(!isMenuOpen)} />
    </SafeAreaView>
  );
}
