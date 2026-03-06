import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/constants/api";
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
import { useUserStore } from "@/stores/store";

export function useDashboard() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const isStaff = user?.role === "empleado";

  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState("");
  const [cashNotes, setCashNotes] = useState("");

  // ─── Queries (auto-refresh via refetchInterval) ────────────
  const { data: profile } = useProfileQuery();
  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useDashboardStatsQuery({ enabled: !isStaff });
  const { data: weeklyData, refetch: refetchWeekly } =
    useWeeklyAttendanceQuery({ enabled: !isStaff });
  const { data: activityData, refetch: refetchActivity } =
    useActivityRateQuery({ enabled: !isStaff });
  const { data: expiringData, refetch: refetchExpiring } =
    useExpiringMembershipsQuery({ enabled: !isStaff });
  const { data: gymSubscription, refetch: refetchSubscription } =
    useGymSubscriptionQuery({ enabled: !isStaff });
  const { data: clients = [], refetch: refetchClients } =
    useClientsQuery(!isStaff);
  const {
    data: cashSummary,
    isFetching: fetchingCashSummary,
    refetch: refetchCashSummary,
  } = useTodayCashSummaryQuery({ enabled: Boolean(user?.gymId) });
  const { data: cashHistory = [], refetch: refetchCashHistory } =
    useCashClosureHistoryQuery(7, {
      enabled: Boolean(user?.gymId),
      refetchInterval: 15_000,
    });
  const closeCashMutation = useCloseCashRegisterMutation();

  // ─── Derived ───────────────────────────────────────────────
  const subscriptionDaysLeft = gymSubscription?.endDate
    ? Math.ceil(
        (new Date(gymSubscription.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const lastClosed = cashHistory[0];
  const previousClosed = cashHistory[1];
  const closureDeltaVsPrevious =
    lastClosed && previousClosed
      ? lastClosed.breakdown.total - previousClosed.breakdown.total
      : 0;

  // ─── Sync avatar ───────────────────────────────────────────
  useEffect(() => {
    if (profile?.avatar && user?.token) {
      const avatarUrl = `${API_BASE_URL}${profile.avatar}`;
      if (user.avatar !== avatarUrl) {
        setUser({ ...user, avatar: avatarUrl }, user.token);
      }
    }
  }, [profile?.avatar, setUser, user]);

  // ─── Actions ───────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchWeekly(),
      refetchActivity(),
      refetchExpiring(),
      refetchSubscription(),
      refetchClients(),
      refetchCashSummary(),
      refetchCashHistory(),
      queryClient.invalidateQueries({ queryKey: ["access", "recent"] }),
    ]);
    setRefreshing(false);
  }, [
    refetchStats,
    refetchWeekly,
    refetchActivity,
    refetchExpiring,
    refetchSubscription,
    refetchClients,
    refetchCashSummary,
    refetchCashHistory,
    queryClient,
  ]);

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

  return {
    user,
    isStaff,
    refreshing,
    onRefresh,

    // Stats
    stats,
    loadingStats,
    weeklyData,
    activityData,
    expiringData,
    clients,

    // Subscription
    gymSubscription,
    subscriptionDaysLeft,

    // Cash
    cashSummary,
    cashHistory,
    fetchingCashSummary,
    closeCashMutation,
    closureDeltaVsPrevious,
    lastClosed,
    previousClosed,
    isCashModalOpen,
    countedCashInput,
    setCountedCashInput,
    cashNotes,
    setCashNotes,
    openCashClosureModal,
    closeCashModal,
    handleConfirmCashClosure,

    // Menu
    isMenuOpen,
    setIsMenuOpen,
    handleActionPress,
  };
}
