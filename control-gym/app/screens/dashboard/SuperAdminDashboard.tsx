import React from "react";
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import * as Haptics from "expo-haptics";
import Header from "@/components/ui/Header";
import SearchInput from "@/components/ui/SearchInput";
import { useSuperAdminDashboard } from "./hooks/useSuperAdminDashboard";
import { useReviewGymRegistration } from "@/hooks/queries/useSuperAdmin";
import { RevenueCard } from "./components/RevenueCard";
import { StatCard } from "./components/StatCard";
import { PlanDistribution } from "./components/PlanDistribution";
import { FilterChips } from "./components/FilterChips";
import { GymAdminList } from "./components/GymAdminList";
import Toast, { ToastType } from "@/components/ui/Toast";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { API_BASE_URL } from "@/constants/api";

export default function SuperAdminDashboard() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const router = useRouter();
  const { colors, primaryColor } = useTheme();
  const reviewMutation = useReviewGymRegistration();
  const [processingGymId, setProcessingGymId] = React.useState<string | null>(
    null,
  );
  const [processingAction, setProcessingAction] = React.useState<
    "approve" | "reject" | null
  >(null);
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: "", type: "success" });

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
    pendingAdmins,
    summary,
    filterOptions,
    isFetching,
    isAutoRefreshEnabled,
    lastUpdatedAt,
    counts,
  } = useSuperAdminDashboard();
  const { data: profile } = useProfileQuery();

  React.useEffect(() => {
    if (!profile?.avatar || !user?.token) return;
    const avatarUrl = `${API_BASE_URL}${profile.avatar}`;
    if (user.avatar !== avatarUrl) {
      setUser({ ...user, avatar: avatarUrl }, user.token);
    }
  }, [profile?.avatar, setUser, user]);

  const formattedLastUpdated =
    lastUpdatedAt > 0
      ? new Date(lastUpdatedAt).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "--:--:--";

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  const handleQuickReview = (
    gymId: string,
    gymName: string,
    action: "approve" | "reject",
  ) => {
    Alert.alert(
      action === "approve" ? "Aprobar registro" : "Rechazar registro",
      `${action === "approve" ? "Aprobar" : "Rechazar"} "${gymName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: action === "approve" ? "Aprobar" : "Rechazar",
          style: action === "approve" ? "default" : "destructive",
          onPress: () => {
            setProcessingGymId(gymId);
            setProcessingAction(action);
            reviewMutation.mutate(
              { gymId, action },
              {
                onSuccess: async () => {
                  await Haptics.notificationAsync(
                    action === "approve"
                      ? Haptics.NotificationFeedbackType.Success
                      : Haptics.NotificationFeedbackType.Warning,
                  );
                  showToast(
                    action === "approve"
                      ? "Registro aprobado"
                      : "Registro rechazado",
                    action === "approve" ? "success" : "warning",
                  );
                },
                onError: async () => {
                  await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error,
                  );
                  showToast("No se pudo actualizar el registro", "error");
                },
                onSettled: () => {
                  setProcessingGymId(null);
                  setProcessingAction(null);
                },
              },
            );
          },
        },
      ],
    );
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
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-wider px-2 mt-2 mb-1"
          >
            Panel Super Admin
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 8,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isAutoRefreshEnabled ? "#10B981" : "#F59E0B",
                }}
              />
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>
                {isAutoRefreshEnabled
                  ? "Actualización automática activa"
                  : "Actualización automática pausada"}
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              {isFetching
                ? "Sincronizando..."
                : `Actualizado ${formattedLastUpdated}`}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#F59E0B15",
              borderColor: "#F59E0B50",
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialIcons name="pending-actions" size={20} color="#F59E0B" />
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>
                  Pendientes de aprobación
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFilterStatus("pending")}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#F59E0B", fontWeight: "700", fontSize: 12 }}>
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
              {counts.pending} gimnasios esperando revisión
            </Text>
            {pendingAdmins.slice(0, 3).map((admin) => (
              (() => {
                const isProcessing = processingGymId === admin.gym?._id;
                const isProcessingApprove =
                  isProcessing && processingAction === "approve";
                const isProcessingReject =
                  isProcessing && processingAction === "reject";
                return (
              <TouchableOpacity
                key={admin._id}
                onPress={() => {
                  if (admin.gym) {
                    router.push({
                      pathname: "/screens/superadmin/gym-detail",
                      params: { gymId: admin.gym._id },
                    } as any);
                  }
                }}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  marginTop: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                    {admin.gym?.name || "Sin gimnasio"}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Admin: {admin.name}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (!admin.gym?._id) return;
                      handleQuickReview(admin.gym._id, admin.gym.name, "approve");
                    }}
                    disabled={isProcessing}
                    style={{
                      backgroundColor: "#10B98120",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      opacity: isProcessing ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>
                      {isProcessingApprove ? "Procesando..." : "Aprobar"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (!admin.gym?._id) return;
                      handleQuickReview(admin.gym._id, admin.gym.name, "reject");
                    }}
                    disabled={isProcessing}
                    style={{
                      backgroundColor: "#DC262620",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      opacity: isProcessing ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ color: "#DC2626", fontSize: 11, fontWeight: "700" }}>
                      {isProcessingReject ? "Procesando..." : "Rechazar"}
                    </Text>
                  </TouchableOpacity>
                  <MaterialIcons name="chevron-right" size={17} color="#F59E0B" />
                </View>
              </TouchableOpacity>
                );
              })()
            ))}
            {pendingAdmins.length === 0 && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 10,
                  marginTop: 4,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  No hay solicitudes pendientes por ahora.
                </Text>
              </View>
            )}
          </View>

          <RevenueCard
            isLoading={isLoading}
            totalRevenue={summary?.totalGymRevenue ?? 0}
            platformRevenue={summary?.totalPlatformRevenue ?? 0}
            platformRevenueThisMonth={summary?.kpis?.platformRevenueThisMonth ?? 0}
            platformRevenueLastMonth={summary?.kpis?.platformRevenueLastMonth ?? 0}
            platformRevenueDeltaPct={summary?.kpis?.platformRevenueDeltaPct ?? 0}
            newGymsThisMonth={summary?.kpis?.newGymsThisMonth ?? 0}
            newGymsLastMonth={summary?.kpis?.newGymsLastMonth ?? 0}
            newGymsDelta={summary?.kpis?.newGymsDelta ?? 0}
          />

          <View className="flex-row gap-3 px-1 my-2">
            <StatCard
              icon="store"
              label="GIMNASIOS"
              value={isLoading ? "..." : String(summary?.totalGyms ?? 0)}
              subtitle={`${counts.active} activos`}
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
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
