import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Toast, { ToastType } from "@/components/ui/Toast";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import {
  useDeleteGym,
  useGymClientsQuery,
  useGymDetailQuery,
  useGymPaymentsQuery,
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
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const planConfig: Record<string, { label: string; color: string; bg: string }> =
  {
    basico: { label: "Basico", color: "#6366F1", bg: "#EEF2FF" },
    pro: { label: "Pro", color: "#7C3AED", bg: "#F5F3FF" },
    proplus: { label: "Pro+", color: "#DB2777", bg: "#FDF2F8" },
  };

const planOptions = [
  { key: "basico", label: "Basico" },
  { key: "pro", label: "Pro" },
  { key: "proplus", label: "Pro+" },
];

const SectionTitle = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {label}
    </Text>
  );
};

const MiniStat = ({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) => {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: `${color}18`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{label}</Text>
    </View>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: `${colors.border}40`,
      }}
    >
      <MaterialIcons name={icon} size={18} color={colors.textSecondary} />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          marginLeft: 10,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor || colors.text,
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

export default function GymDetailScreen() {
  const { gymId } = useLocalSearchParams();
  const { colors, primaryColor, isDark } = useTheme();
  const router = useRouter();

  const { data, isLoading, error, refetch, isRefetching } = useGymDetailQuery(
    gymId as string,
  );
  const { data: memberships = [] } = useMembershipHistoryQuery(gymId as string);
  const { data: clientsData } = useGymClientsQuery(gymId as string, {
    limit: 5,
  });
  const { data: paymentsData } = useGymPaymentsQuery(gymId as string, 5);
  const { data: staffData } = useGymStaffQuery(gymId as string);

  const toggleMutation = useToggleGymActive();
  const reviewMutation = useReviewGymRegistration();
  const updateMutation = useUpdateGym();
  const deleteMutation = useDeleteGym();
  const resetMutation = useResetAdminPassword();

  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [clientsExpanded, setClientsExpanded] = useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);
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

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "--";

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  const onRefresh = async () => {
    await refetch();
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
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
          <Text
            style={{ color: colors.error, marginTop: 12, textAlign: "center" }}
          >
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
    if (!editName.trim())
      return Alert.alert("Error", "El nombre es obligatorio");
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
      return Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres",
      );
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
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 18,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>
            {gym.name}
          </Text>
          {admin?.name ? (
            <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
              {admin.name}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
            <View
              style={{
                backgroundColor: isDark ? `${plan.color}25` : plan.bg,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ color: plan.color, fontWeight: "700", fontSize: 12 }}
              >
                {plan.label}
              </Text>
            </View>
            <Badge label={statusLabel} />
          </View>
        </View>

        {!isApproved && (
          <View style={{ marginTop: 16 }}>
            <SectionTitle label="Revision de Alta (Prioridad)" />
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: isPending ? "#F59E0B50" : `${colors.error}50`,
              }}
            >
              <InfoRow
                icon="confirmation-number"
                label="ID de pago"
                value={gym.paymentReference || "--"}
              />
              <InfoRow
                icon="schedule"
                label="Estado onboarding"
                value={statusLabel}
                valueColor={statusColor}
              />
              <InfoRow
                icon="event"
                label="Comprobante subido"
                value={formatDate(gym.paymentProofUploadedAt || undefined)}
              />
              {gym.paymentRejectionReason ? (
                <InfoRow
                  icon="error-outline"
                  label="Motivo rechazo"
                  value={gym.paymentRejectionReason}
                  valueColor={colors.error}
                />
              ) : null}
              {gym.paymentProofUrl ? (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    Imagen de comprobante
                  </Text>
                  <Image
                    source={{ uri: `${API_BASE_URL}${gym.paymentProofUrl}` }}
                    style={{
                      width: "100%",
                      height: 220,
                      borderRadius: 12,
                      backgroundColor: colors.background,
                    }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <Text style={{ color: "#F59E0B", marginTop: 10, fontSize: 13 }}>
                  Aun no hay comprobante subido.
                </Text>
              )}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={approveRegistration}
                  disabled={reviewMutation.isPending}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDark ? "#10B98130" : "#D1FAE5",
                    opacity: reviewMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: "#10B981", fontWeight: "800" }}>
                    Aprobar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={rejectRegistration}
                  disabled={reviewMutation.isPending}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDark ? "#DC262630" : "#FEE2E2",
                    opacity: reviewMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: "#DC2626", fontWeight: "800" }}>
                    Rechazar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {isApproved && (
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

        <View style={{ marginTop: 16 }}>
          <SectionTitle label="Informacion del Plan" />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
              paddingHorizontal: 14,
            }}
          >
            <InfoRow
              icon="card-membership"
              label="Plan actual"
              value={plan.label}
              valueColor={plan.color}
            />
            <InfoRow
              icon="event"
              label="Inicio del plan"
              value={formatDate(membership?.startDate)}
            />
            <InfoRow
              icon="event-busy"
              label="Expiracion"
              value={formatDate(membership?.endDate)}
            />
            <InfoRow
              icon="schedule"
              label="Estado membresia"
              value={
                isApproved ? currentStatus.label : "Pendiente de aprobacion"
              }
              valueColor={isApproved ? currentStatus.color : "#F59E0B"}
            />
            {admin?.email ? (
              <InfoRow icon="email" label="Email admin" value={admin.email} />
            ) : null}
            <InfoRow
              icon="location-on"
              label="Direccion"
              value={gym.address || "--"}
            />
            <View style={{ borderBottomWidth: 0 }}>
              <InfoRow icon="badge" label="Staff" value={String(staffCount)} />
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setHistoryExpanded((prev) => !prev)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionTitle label="Historial de Actualizaciones de Membresia" />
            <MaterialIcons
              name={historyExpanded ? "expand-less" : "expand-more"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {historyExpanded && (
            <View style={{ gap: 10 }}>
              {memberships.length === 0 ? (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                  }}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    Sin historial de membresias.
                  </Text>
                </View>
              ) : (
                memberships.map((m) => {
                  const cfg = planConfig[m.plan] || planConfig.basico;
                  const reviewMap: Record<
                    string,
                    { label: string; color: string }
                  > = {
                    pending: { label: "Pendiente", color: "#F59E0B" },
                    approved: { label: "Aprobado", color: colors.success },
                    rejected: { label: "Rechazado", color: colors.error },
                    manual: { label: "Manual", color: colors.textSecondary },
                  };
                  const review = reviewMap[m.reviewStatus || "manual"];
                  return (
                    <View
                      key={m._id}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        borderWidth: isDark ? 1 : 0,
                        borderColor: colors.border,
                        padding: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: isDark ? `${cfg.color}20` : cfg.bg,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: cfg.color,
                              fontWeight: "700",
                              fontSize: 11,
                            }}
                          >
                            {cfg.label}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: review.color,
                            fontWeight: "700",
                            fontSize: 12,
                          }}
                        >
                          {review.label}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        {formatDate(m.startDate)} - {formatDate(m.endDate)} | $
                        {m.amount?.toLocaleString() || 0}
                      </Text>
                      {m.paymentReference ? (
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Ref pago: {m.paymentReference}
                        </Text>
                      ) : null}
                      {m.reviewNotes ? (
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Nota: {m.reviewNotes}
                        </Text>
                      ) : null}
                      {m.paymentProofUrl ? (
                        <Image
                          source={{
                            uri: `${API_BASE_URL}${m.paymentProofUrl}`,
                          }}
                          style={{
                            marginTop: 10,
                            width: "100%",
                            height: 160,
                            borderRadius: 10,
                          }}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        {isApproved && (
          <>
            <View style={{ marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setClientsExpanded((prev) => !prev)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SectionTitle label="Clientes recientes" />
                <MaterialIcons
                  name={clientsExpanded ? "expand-less" : "expand-more"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {clientsExpanded && (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: colors.border,
                    gap: 8,
                  }}
                >
                  {(clientsData?.clients || []).length === 0 ? (
                    <Text style={{ color: colors.textSecondary }}>
                      Sin clientes registrados
                    </Text>
                  ) : (
                    clientsData?.clients?.map((c) => (
                      <View
                        key={c._id}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ color: colors.text, fontSize: 13 }}>
                          {c.firstName} {c.lastName}
                        </Text>
                        <Text
                          style={{ color: colors.textSecondary, fontSize: 12 }}
                        >
                          {c.isActive ? "Activo" : "Inactivo"}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>

            <View style={{ marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setPaymentsExpanded((prev) => !prev)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SectionTitle label="Pagos recientes" />
                <MaterialIcons
                  name={paymentsExpanded ? "expand-less" : "expand-more"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {paymentsExpanded && (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: colors.border,
                    gap: 8,
                  }}
                >
                  {(paymentsData?.payments || []).length === 0 ? (
                    <Text style={{ color: colors.textSecondary }}>
                      Sin pagos registrados
                    </Text>
                  ) : (
                    paymentsData?.payments?.map((p) => (
                      <View
                        key={p._id}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ color: colors.text, fontSize: 13 }}>
                          {p.clientName}
                        </Text>
                        <Text
                          style={{
                            color: "#10B981",
                            fontWeight: "700",
                            fontSize: 13,
                          }}
                        >
                          ${p.amount.toLocaleString()}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>

            {!!staffData?.length && (
              <View style={{ marginTop: 16 }}>
                <SectionTitle label={`Staff (${staffData.length})`} />
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: colors.border,
                    gap: 8,
                  }}
                >
                  {staffData.map((s) => (
                    <View
                      key={s._id}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Avatar size="sm" name={s.name} uri={s.avatar} />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          {s.name}
                        </Text>
                        <Text
                          style={{ color: colors.textSecondary, fontSize: 11 }}
                        >
                          {s.email}
                        </Text>
                      </View>
                      <Badge label={s.active ? "Activo" : "Inactivo"} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ marginTop: 16 }}>
              <SectionTitle label="Acciones" />
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  onPress={toggleGym}
                  disabled={toggleMutation.isPending}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: gym.active
                      ? isDark
                        ? "#DC262630"
                        : "#FEE2E2"
                      : isDark
                        ? "#10B98130"
                        : "#D1FAE5",
                  }}
                >
                  <Text
                    style={{
                      color: gym.active ? "#DC2626" : "#10B981",
                      fontWeight: "800",
                    }}
                  >
                    {toggleMutation.isPending
                      ? "Procesando..."
                      : gym.active
                        ? "Deshabilitar Gimnasio"
                        : "Habilitar Gimnasio"}
                  </Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={openEdit}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      backgroundColor: isDark ? `${primaryColor}25` : "#F0FDF4",
                    }}
                  >
                    <Text style={{ color: primaryColor, fontWeight: "800" }}>
                      Editar
                    </Text>
                  </TouchableOpacity>
                  {admin ? (
                    <TouchableOpacity
                      onPress={() => setResetVisible(true)}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                        backgroundColor: isDark ? "#1E3A8A50" : "#DBEAFE",
                      }}
                    >
                      <Text style={{ color: "#2563EB", fontWeight: "800" }}>
                        Reset Password
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={deleteGym}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: isDark ? "#7F1D1D70" : "#FECACA",
                  }}
                >
                  <Text style={{ color: colors.error, fontWeight: "800" }}>
                    Eliminar gimnasio
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000070",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "800",
                fontSize: 18,
                marginBottom: 12,
              }}
            >
              Editar gimnasio
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Direccion"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 10,
              }}
            />
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              {planOptions.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() =>
                    setEditPlan(p.key as "basico" | "pro" | "proplus")
                  }
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                    backgroundColor:
                      editPlan === p.key ? primaryColor : colors.background,
                    borderWidth: 1,
                    borderColor:
                      editPlan === p.key ? primaryColor : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: editPlan === p.key ? "#0D1C3D" : colors.text,
                      fontWeight: "700",
                    }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 11,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: colors.textSecondary, fontWeight: "700" }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                disabled={updateMutation.isPending}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  paddingVertical: 11,
                  alignItems: "center",
                  backgroundColor: primaryColor,
                  opacity: updateMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#0D1C3D", fontWeight: "800" }}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={resetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000070",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "800",
                fontSize: 18,
                marginBottom: 12,
              }}
            >
              Resetear contraseña admin
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Nueva contraseña"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setResetVisible(false)}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 11,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: colors.textSecondary, fontWeight: "700" }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetAdminPassword}
                disabled={resetMutation.isPending}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  paddingVertical: 11,
                  alignItems: "center",
                  backgroundColor: "#2563EB",
                  opacity: resetMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                  {resetMutation.isPending ? "Procesando..." : "Resetear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
