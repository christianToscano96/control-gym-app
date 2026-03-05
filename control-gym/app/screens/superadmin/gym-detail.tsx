import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Toast, { ToastType } from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import {
  useDeleteGym,
  useGymDetailQuery,
  useGymStaffQuery,
  useMembershipHistoryQuery,
  useResetAdminPassword,
  useReviewGymRegistration,
  useToggleGymActive,
  useUpdateGym,
} from "@/hooks/queries/useSuperAdmin";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionsSection } from "./gym-detail-components/ActionsSection";
import { EditGymModal } from "./gym-detail-components/EditGymModal";
import { GymHeaderCard } from "./gym-detail-components/GymHeaderCard";
import { MembershipHistorySection } from "./gym-detail-components/MembershipHistorySection";
import { OnboardingReviewSection } from "./gym-detail-components/OnboardingReviewSection";
import { PlanInfoSection } from "./gym-detail-components/PlanInfoSection";
import { ResetPasswordModal } from "./gym-detail-components/ResetPasswordModal";
import { StaffSection } from "./gym-detail-components/StaffSection";
import { planConfig } from "./gym-detail-components/constants";
import { formatDate } from "./gym-detail-components/utils";
import { MiniStat } from "./gym-detail-components/ui";

export default function GymDetailScreen() {
  const { gymId } = useLocalSearchParams();
  const { colors, primaryColor } = useTheme();
  const router = useRouter();

  const { data, isLoading, error, refetch, isRefetching } = useGymDetailQuery(
    gymId as string,
  );
  const { data: memberships = [] } = useMembershipHistoryQuery(gymId as string);
  const { data: staffData } = useGymStaffQuery(gymId as string);

  const toggleMutation = useToggleGymActive();
  const reviewMutation = useReviewGymRegistration();
  const updateMutation = useUpdateGym();
  const deleteMutation = useDeleteGym();
  const resetMutation = useResetAdminPassword();

  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPlan, setEditPlan] = useState<"basico" | "pro" | "proplus">(
    "basico",
  );
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: "", type: "success" });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  const hapticSuccess = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  const hapticWarning = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  const hapticError = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 16 }}>
          <HeaderTopScrenn title="Detalle Gimnasio" isBackButton />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 16 }}>
          <HeaderTopScrenn title="Detalle" isBackButton />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <MaterialIcons name="error-outline" size={50} color={colors.error} />
          <Text style={{ color: colors.error, marginTop: 12, textAlign: "center" }}>
            {error?.message || "No se pudo cargar el gimnasio"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    gym,
    admin,
    membership,
    clientsCount,
    activeClientsCount,
    platformRevenue,
    monthlyGymRevenue,
    staffCount,
  } = data;

  const onboardingStatus = gym.onboardingStatus || "approved";
  const isApproved = onboardingStatus === "approved";
  const isPending = onboardingStatus === "pending";
  const statusColor = isPending
    ? "#F59E0B"
    : isApproved
      ? colors.success
      : colors.error;
  const statusLabel = isPending
    ? "Pendiente"
    : isApproved
      ? "Aprobado"
      : "Rechazado";
  const plan = planConfig[gym.plan];

  const currentStatus = (() => {
    if (!membership) return { label: "Sin plan", color: colors.error };
    const daysLeft = Math.ceil(
      (new Date(membership.endDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) return { label: "Expirado", color: colors.error };
    if (daysLeft <= 7)
      return { label: `${daysLeft} dias restantes`, color: colors.warning };
    return { label: `${daysLeft} dias restantes`, color: colors.success };
  })();

  const openEdit = () => {
    setEditName(gym.name);
    setEditAddress(gym.address || "");
    setEditPlan(gym.plan);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    updateMutation.mutate(
      {
        gymId: gym._id,
        data: {
          name: editName.trim(),
          address: editAddress.trim(),
          plan: editPlan,
        },
      },
      {
        onSuccess: () => {
          setEditVisible(false);
          hapticSuccess();
          showToast("Gimnasio actualizado");
        },
        onError: () => {
          hapticError();
          showToast("No se pudo actualizar", "error");
        },
      },
    );
  };

  const toggleGym = () => {
    const action = gym.active ? "Deshabilitar" : "Habilitar";
    Alert.alert(`${action} gimnasio`, `${action} "${gym.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: action,
        style: gym.active ? "destructive" : "default",
        onPress: () => {
          toggleMutation.mutate(
            { gymId: gym._id, active: !gym.active },
            {
              onSuccess: () => {
                hapticSuccess();
                showToast(
                  gym.active ? "Gimnasio deshabilitado" : "Gimnasio habilitado",
                );
              },
              onError: () => {
                hapticError();
                showToast("No se pudo actualizar estado", "error");
              },
            },
          );
        },
      },
    ]);
  };

  const approveRegistration = () => {
    reviewMutation.mutate(
      { gymId: gym._id, action: "approve" },
      {
        onSuccess: () => {
          hapticSuccess();
          showToast("Registro aprobado y dashboard habilitado");
        },
        onError: () => {
          hapticError();
          showToast("No se pudo aprobar", "error");
        },
      },
    );
  };

  const rejectRegistration = () => {
    reviewMutation.mutate(
      { gymId: gym._id, action: "reject" },
      {
        onSuccess: () => {
          hapticWarning();
          showToast("Registro rechazado", "warning");
        },
        onError: () => {
          hapticError();
          showToast("No se pudo rechazar", "error");
        },
      },
    );
  };

  const deleteGym = () => {
    Alert.alert(
      "Eliminar gimnasio",
      `Eliminar "${gym.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(gym._id, {
              onSuccess: () => {
                hapticSuccess();
                router.back();
              },
              onError: () => {
                hapticError();
                showToast("No se pudo eliminar", "error");
              },
            });
          },
        },
      ],
    );
  };

  const resetAdminPassword = () => {
    if (!admin?._id) return;
    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    resetMutation.mutate(
      { adminId: admin._id, newPassword },
      {
        onSuccess: () => {
          setNewPassword("");
          setResetVisible(false);
          hapticSuccess();
          showToast("Contraseña reseteada");
        },
        onError: () => {
          hapticError();
          showToast("No se pudo resetear", "error");
        },
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Detalle Gimnasio" isBackButton />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        <GymHeaderCard
          gymName={gym.name}
          adminName={admin?.name}
          planLabel={plan.label}
          planColor={plan.color}
          planBg={plan.bg}
          statusLabel={statusLabel}
        />

        {!isApproved ? (
          <OnboardingReviewSection
            isPending={isPending}
            statusLabel={statusLabel}
            statusColor={statusColor}
            paymentReference={gym.paymentReference}
            paymentProofUploadedAt={gym.paymentProofUploadedAt}
            paymentRejectionReason={gym.paymentRejectionReason}
            paymentProofUrl={gym.paymentProofUrl}
            onApprove={approveRegistration}
            onReject={rejectRegistration}
            loading={reviewMutation.isPending}
            formatDate={formatDate}
          />
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <MiniStat
                icon="people"
                label="Clientes activos"
                value={activeClientsCount}
                color={primaryColor}
              />
              <MiniStat
                icon="groups"
                label="Clientes totales"
                value={clientsCount}
                color="#6366F1"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <MiniStat
                icon="attach-money"
                label="Ingresos del mes"
                value={`$${monthlyGymRevenue.toLocaleString()}`}
                color="#10B981"
              />
              <MiniStat
                icon="card-membership"
                label="Revenue plataforma"
                value={`$${platformRevenue.toLocaleString()}`}
                color="#06B6D4"
              />
            </View>
          </>
        )}

        <PlanInfoSection
          planLabel={plan.label}
          planColor={plan.color}
          membershipStartDate={formatDate(membership?.startDate)}
          membershipEndDate={formatDate(membership?.endDate)}
          membershipStatusLabel={
            isApproved ? currentStatus.label : "Pendiente de aprobacion"
          }
          membershipStatusColor={isApproved ? currentStatus.color : "#F59E0B"}
          adminEmail={admin?.email}
          address={gym.address}
          staffCount={staffCount}
        />

        <MembershipHistorySection
          expanded={historyExpanded}
          onToggle={() => setHistoryExpanded((prev) => !prev)}
          memberships={memberships}
          formatDate={formatDate}
        />

        {isApproved && (
          <>
            <StaffSection staff={staffData || []} />

            <ActionsSection
              gymActive={gym.active}
              showReset={Boolean(admin)}
              toggleLoading={toggleMutation.isPending}
              onToggleGym={toggleGym}
              onOpenEdit={openEdit}
              onOpenReset={() => setResetVisible(true)}
              onDelete={deleteGym}
            />
          </>
        )}
      </ScrollView>

      <EditGymModal
        visible={editVisible}
        name={editName}
        address={editAddress}
        plan={editPlan}
        loading={updateMutation.isPending}
        onClose={() => setEditVisible(false)}
        onSave={saveEdit}
        onChangeName={setEditName}
        onChangeAddress={setEditAddress}
        onChangePlan={setEditPlan}
      />

      <ResetPasswordModal
        visible={resetVisible}
        password={newPassword}
        loading={resetMutation.isPending}
        onClose={() => setResetVisible(false)}
        onChangePassword={setNewPassword}
        onSubmit={resetAdminPassword}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
