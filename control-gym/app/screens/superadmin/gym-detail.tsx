import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";
import {
  useGymDetailQuery,
  useToggleGymActive,
  useUpdateGym,
  useDeleteGym,
  useResetAdminPassword,
  useMembershipHistoryQuery,
  useGymClientsQuery,
  useGymPaymentsQuery,
  // useGymAccessLogsQuery,
  useGymStaffQuery,
} from "@/hooks/queries/useSuperAdmin";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Toast, { ToastType } from "@/components/ui/Toast";

// ─── Plan Config ─────────────────────────────────────────────
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

// ─── Skeleton ────────────────────────────────────────────────
const SkeletonBox = ({
  width,
  height,
  radius = 12,
  style,
}: {
  width: number | string;
  height: number;
  radius?: number;
  style?: any;
}) => {
  const { isDark } = useTheme();
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: isDark ? "#1f2937" : "#e5e7eb",
        },
        style,
      ]}
    />
  );
};

const DetailSkeleton = () => {
  const { colors, isDark } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <SkeletonBox width={64} height={64} radius={32} />
          <SkeletonBox width={160} height={22} style={{ marginTop: 12 }} />
          <SkeletonBox width={100} height={14} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <SkeletonBox width={60} height={24} radius={8} />
            <SkeletonBox width={60} height={24} radius={8} />
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 16,
          marginTop: 16,
        }}
      >
        <SkeletonBox width="48%" height={120} radius={16} />
        <SkeletonBox width="48%" height={120} radius={16} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <SkeletonBox width="100%" height={48} radius={14} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <SkeletonBox width="100%" height={280} radius={16} />
      </View>
    </ScrollView>
  );
};

// ─── InfoRow ─────────────────────────────────────────────────
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + "40",
      }}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={colors.textSecondary}
        style={{ marginRight: 12 }}
      />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          fontWeight: "500",
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor || colors.text,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
};

// ─── Section Label ───────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        paddingLeft: 4,
      }}
    >
      {label}
    </Text>
  );
};

// ─── Mini Stat Card ──────────────────────────────────────────
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
        padding: 14,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${color}15`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: colors.text,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textSecondary,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default function GymDetailScreen() {
  const { gymId } = useLocalSearchParams();
  const { colors, primaryColor, isDark } = useTheme();
  const router = useRouter();

  // ─── Queries ─────────────────────────────────────────────
  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useGymDetailQuery(gymId as string);

  const { data: membershipHistory } = useMembershipHistoryQuery(
    gymId as string,
  );
  const { data: clientsData } = useGymClientsQuery(gymId as string, {
    limit: 5,
  });
  const { data: paymentsData } = useGymPaymentsQuery(gymId as string, 5);
  // const { data: accessData } = useGymAccessLogsQuery(gymId as string, 5);
  const { data: staffData } = useGymStaffQuery(gymId as string);

  // ─── Mutations ───────────────────────────────────────────
  const toggleMutation = useToggleGymActive();
  const updateMutation = useUpdateGym();
  const deleteMutation = useDeleteGym();
  const resetPasswordMutation = useResetAdminPassword();

  // ─── Local State ─────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [resetPwVisible, setResetPwVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [clientsExpanded, setClientsExpanded] = useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);
  // const [accessExpanded, setAccessExpanded] = useState(false);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ─── Handlers ────────────────────────────────────────────
  const openEditModal = () => {
    if (!data) return;
    setEditName(data.gym.name);
    setEditAddress(data.gym.address);
    setEditPlan(data.gym.plan);
    setEditVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    updateMutation.mutate(
      {
        gymId: data!.gym._id,
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
          showToast("Gimnasio actualizado correctamente");
        },
        onError: () => {
          hapticError();
          showToast("No se pudo actualizar el gimnasio", "error");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!data) return;
    hapticWarning();
    Alert.alert(
      "Eliminar Gimnasio",
      `Eliminar "${data.gym.name}"?\n\nSe borraran admin, clientes, pagos, accesos y membresias. No se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(data.gym._id, {
              onSuccess: () => {
                hapticSuccess();
                router.back();
              },
              onError: () => {
                hapticError();
                showToast("No se pudo eliminar el gimnasio", "error");
              },
            });
          },
        },
      ],
    );
  };

  const handleToggle = () => {
    if (!data) return;
    const isActive = data.gym.active;
    hapticWarning();
    Alert.alert(
      `${isActive ? "Deshabilitar" : "Habilitar"} Gimnasio`,
      `${isActive ? "Deshabilitar" : "Habilitar"} "${data.gym.name}"?${isActive ? "\n\nSu plan sera expirado inmediatamente." : "\n\nSe renovara su plan por 1 mes."}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: isActive ? "Deshabilitar" : "Habilitar",
          style: isActive ? "destructive" : "default",
          onPress: () => {
            toggleMutation.mutate(
              { gymId: data.gym._id, active: !isActive },
              {
                onSuccess: () => {
                  hapticSuccess();
                  showToast(
                    isActive
                      ? "Gimnasio deshabilitado"
                      : "Gimnasio habilitado exitosamente",
                    isActive ? "warning" : "success",
                  );
                },
              },
            );
          },
        },
      ],
    );
  };

  const handleResetPassword = () => {
    if (!data?.admin) return;
    if (newPassword.length < 6) {
      Alert.alert("Error", "La contrasena debe tener al menos 6 caracteres");
      return;
    }
    resetPasswordMutation.mutate(
      { adminId: (data.admin as any)._id, newPassword },
      {
        onSuccess: () => {
          setResetPwVisible(false);
          setNewPassword("");
          hapticSuccess();
          showToast("Contrasena reseteada correctamente");
        },
        onError: () => {
          hapticError();
          showToast("No se pudo resetear la contrasena", "error");
        },
      },
    );
  };

  // ─── Loading State ─────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 16 }}>
          <HeaderTopScrenn title="Detalle Gimnasio" isBackButton />
        </View>
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (queryError || !data) {
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
            paddingHorizontal: 32,
          }}
        >
          <MaterialIcons name="error-outline" size={56} color={colors.error} />
          <Text
            style={{
              marginTop: 16,
              textAlign: "center",
              fontSize: 16,
              color: colors.error,
            }}
          >
            {queryError?.message || "No se encontro el gimnasio"}
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
    gymRevenue,
    monthlyGymRevenue,
    // todayCheckIns,
    // todayDenied,
    staffCount,
  } = data;
  const isActive = gym.active;
  const statusColor = isActive ? colors.success : colors.error;
  const plan = planConfig[gym.plan];

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // const formatTime = (dateStr: string) => {
  //   return new Date(dateStr).toLocaleTimeString("es-AR", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const getMembershipStatus = () => {
    if (!membership) return { label: "Sin plan", color: colors.error };
    const endDate = new Date(membership.endDate);
    const now = new Date();
    const daysLeft = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) return { label: "Expirado", color: colors.error };
    if (daysLeft <= 7)
      return { label: `${daysLeft} dias restantes`, color: colors.warning };
    return { label: `${daysLeft} dias restantes`, color: colors.success };
  };

  const membershipStatus = getMembershipStatus();

  const pastMemberships = (membershipHistory || [])
    .filter((m) => !m.active)
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Detalle Gimnasio" isBackButton />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {/* ─── Header Card ─── */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ paddingHorizontal: 16, marginTop: 8 }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
              shadowColor: isDark ? "transparent" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ marginBottom: 12 }}>
              <Avatar
                size="lg"
                name={admin?.name || gym.name}
                uri={admin?.avatar}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: statusColor,
                  borderWidth: 3,
                  borderColor: colors.card,
                }}
              />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: "800",
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {gym.name}
            </Text>
            {admin && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                {admin.name}
              </Text>
            )}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {plan && (
                <View
                  style={{
                    backgroundColor: isDark ? `${plan.color}20` : plan.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: plan.color,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {plan.label}
                  </Text>
                </View>
              )}
              <Badge label={isActive ? "Activo" : "Inactivo"} />
            </View>
          </View>
        </Animated.View>

        {/* ─── Stats Cards (4 mini stats) ─── */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 16,
            marginTop: 16,
          }}
        >
          <MiniStat
            icon="people"
            label="Clientes activos"
            value={activeClientsCount}
            color={primaryColor}
          />
          {/* Check-ins comentado - no necesario por ahora */}
          {/* <MiniStat
            icon="qr-code-scanner"
            label="Check-ins hoy"
            value={todayCheckIns}
            color="#6366F1"
          /> */}
          <MiniStat
            icon="people-outline"
            label="Clientes totales"
            value={clientsCount}
            color="#6366F1"
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          <MiniStat
            icon="attach-money"
            label="Ingresos mes"
            value={`$${monthlyGymRevenue.toLocaleString()}`}
            color="#10B981"
          />
          <MiniStat
            icon="badge"
            label="Staff"
            value={staffCount}
            color="#F59E0B"
          />
        </View>

        {/* ─── Revenue Cards ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <SectionLabel label="Ingresos" />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.border + "40",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#10B98115",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <MaterialIcons name="storefront" size={16} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  INGRESOS DEL GYM (clientes)
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  ${gymRevenue.toLocaleString()}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#6366F115",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <MaterialIcons
                  name="account-balance"
                  size={16}
                  color="#6366F1"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  PAGO PLATAFORMA (SaaS)
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  ${platformRevenue.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Clients Section ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setClientsExpanded(!clientsExpanded)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            <SectionLabel label={`Clientes (${clientsCount} total)`} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  color: colors.success,
                  fontSize: 12,
                  fontWeight: "600",
                  marginRight: 4,
                }}
              >
                {activeClientsCount} activos
              </Text>
              <MaterialIcons
                name={clientsExpanded ? "expand-less" : "expand-more"}
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {clientsExpanded && clientsData && (
            <Animated.View entering={FadeIn.duration(300)}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                  gap: 6,
                }}
              >
                {clientsData.clients.length === 0 ? (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      textAlign: "center",
                      paddingVertical: 16,
                      fontSize: 13,
                    }}
                  >
                    Sin clientes registrados
                  </Text>
                ) : (
                  clientsData.clients.map((client) => {
                    const daysLeft = client.endDate
                      ? Math.ceil(
                          (new Date(client.endDate).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : 0;
                    const clientColor = !client.isActive
                      ? colors.error
                      : daysLeft <= 7
                        ? colors.warning
                        : colors.success;
                    const memberConfig = planConfig[client.membershipType];

                    return (
                      <View
                        key={client._id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 8,
                          paddingHorizontal: 4,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border + "30",
                        }}
                      >
                        <View
                          style={{
                            width: 4,
                            height: 28,
                            borderRadius: 2,
                            backgroundColor: clientColor,
                            marginRight: 10,
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              fontWeight: "600",
                            }}
                            numberOfLines={1}
                          >
                            {client.firstName} {client.lastName}
                          </Text>
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: 11,
                            }}
                          >
                            {client.isActive
                              ? `${daysLeft}d restantes`
                              : "Inactivo"}
                          </Text>
                        </View>
                        {memberConfig && (
                          <View
                            style={{
                              backgroundColor: isDark
                                ? `${memberConfig.color}20`
                                : memberConfig.bg,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                color: memberConfig.color,
                                fontSize: 10,
                                fontWeight: "700",
                              }}
                            >
                              {memberConfig.label}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </Animated.View>
          )}
        </View>

        {/* ─── Recent Payments Section ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setPaymentsExpanded(!paymentsExpanded)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            <SectionLabel label="Ultimos Pagos" />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  color: "#10B981",
                  fontSize: 12,
                  fontWeight: "600",
                  marginRight: 4,
                }}
              >
                ${paymentsData?.monthlyRevenue?.toLocaleString() || 0} este mes
              </Text>
              <MaterialIcons
                name={paymentsExpanded ? "expand-less" : "expand-more"}
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {paymentsExpanded && paymentsData && (
            <Animated.View entering={FadeIn.duration(300)}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                  gap: 6,
                }}
              >
                {paymentsData.payments.length === 0 ? (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      textAlign: "center",
                      paddingVertical: 16,
                      fontSize: 13,
                    }}
                  >
                    Sin pagos registrados
                  </Text>
                ) : (
                  paymentsData.payments.map((payment) => (
                    <View
                      key={payment._id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border + "30",
                      }}
                    >
                      <MaterialIcons
                        name={
                          payment.method === "efectivo"
                            ? "payments"
                            : "account-balance"
                        }
                        size={16}
                        color={colors.textSecondary}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                          numberOfLines={1}
                        >
                          {payment.clientName}
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 11,
                          }}
                        >
                          {formatDate(payment.date)} - {payment.period || "--"}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#10B981",
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        ${payment.amount.toLocaleString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </Animated.View>
          )}
        </View>

        {/* ─── Recent Access Section (comentado - no necesario por ahora) ─── */}

        {/* ─── Staff Section ─── */}
        {staffData && staffData.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <SectionLabel label={`Staff (${staffData.length})`} />
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 12,
                borderWidth: isDark ? 1 : 0,
                borderColor: colors.border,
                gap: 6,
              }}
            >
              {staffData.map((s) => (
                <View
                  key={s._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "30",
                  }}
                >
                  <Avatar size="sm" name={s.name} uri={s.avatar} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
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
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                      }}
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

        {/* ─── Info Card: Plan & Membership ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <SectionLabel label="Informacion del Plan" />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <InfoRow
              icon="card-membership"
              label="Plan actual"
              value={plan?.label || gym.plan}
              valueColor={plan?.color}
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
              valueColor={membershipStatus.color}
            />
            <InfoRow
              icon="schedule"
              label="Estado"
              value={membershipStatus.label}
              valueColor={membershipStatus.color}
            />
            {admin?.email && (
              <InfoRow icon="email" label="Email admin" value={admin.email} />
            )}
            <InfoRow
              icon="location-on"
              label="Direccion"
              value={gym.address || "--"}
            />
            <View style={{ borderBottomWidth: 0 }}>
              <InfoRow
                icon="date-range"
                label="Registrado"
                value={formatDate(gym.createdAt)}
              />
            </View>
          </View>
        </View>

        {/* ─── Membership History ─── */}
        {pastMemberships.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => setHistoryExpanded(!historyExpanded)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              <SectionLabel label="Historial de Planes" />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginRight: 4,
                  }}
                >
                  {pastMemberships.length}
                </Text>
                <MaterialIcons
                  name={historyExpanded ? "expand-less" : "expand-more"}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
            {historyExpanded && (
              <Animated.View entering={FadeIn.duration(300)}>
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: colors.border,
                    gap: 12,
                  }}
                >
                  {pastMemberships.map((m) => {
                    const cfg = planConfig[m.plan];
                    return (
                      <View
                        key={m._id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border + "30",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: isDark
                              ? `${cfg?.color || "#666"}20`
                              : cfg?.bg || "#f3f4f6",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            marginRight: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: cfg?.color || colors.textSecondary,
                              fontSize: 11,
                              fontWeight: "700",
                            }}
                          >
                            {cfg?.label || m.plan}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {formatDate(m.startDate)} - {formatDate(m.endDate)}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          ${m.amount?.toLocaleString() || "0"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </View>
        )}

        {/* ─── Actions ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <SectionLabel label="Acciones" />
          <TouchableOpacity
            onPress={handleToggle}
            disabled={toggleMutation.isPending}
            activeOpacity={0.8}
            style={{
              backgroundColor: isActive
                ? isDark
                  ? "#DC262620"
                  : "#FEE2E2"
                : isDark
                  ? "#10B98120"
                  : "#D1FAE5",
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: toggleMutation.isPending ? 0.5 : 1,
            }}
          >
            {toggleMutation.isPending ? (
              <ActivityIndicator
                size="small"
                color={isActive ? "#DC2626" : "#10B981"}
              />
            ) : (
              <MaterialIcons
                name={isActive ? "block" : "check-circle"}
                size={20}
                color={isActive ? "#DC2626" : "#10B981"}
              />
            )}
            <Text
              style={{
                color: isActive ? "#DC2626" : "#10B981",
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {toggleMutation.isPending
                ? "Procesando..."
                : isActive
                  ? "Deshabilitar Gimnasio"
                  : "Habilitar Gimnasio"}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              onPress={openEditModal}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: isDark ? `${primaryColor}20` : "#F0FDF4",
                borderRadius: 14,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <MaterialIcons name="edit" size={18} color={primaryColor} />
              <Text
                style={{
                  color: primaryColor,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                Editar
              </Text>
            </TouchableOpacity>

            {admin && (
              <TouchableOpacity
                onPress={() => {
                  setNewPassword("");
                  setResetPwVisible(true);
                }}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "#3B82F620" : "#EFF6FF",
                  borderRadius: 14,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <MaterialIcons name="lock-reset" size={18} color="#3B82F6" />
                <Text
                  style={{
                    color: "#3B82F6",
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  Password
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: isDark ? "#DC262620" : "#FEE2E2",
                borderRadius: 14,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: deleteMutation.isPending ? 0.5 : 1,
              }}
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <MaterialIcons name="delete" size={18} color="#DC2626" />
              )}
              <Text
                style={{ color: "#DC2626", fontWeight: "700", fontSize: 14 }}
              >
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ─── Toast ─── */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* ─── Edit Modal ─── */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
              >
                Editar Gimnasio
              </Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Nombre
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre del gimnasio"
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 14,
              }}
            />

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Direccion
            </Text>
            <TextInput
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Direccion"
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 14,
              }}
            />

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Plan
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {planOptions.map((p) => {
                const selected = editPlan === p.key;
                const cfg = planConfig[p.key];
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setEditPlan(p.key)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor: selected
                        ? isDark
                          ? `${cfg.color}30`
                          : cfg.bg
                        : colors.card,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? cfg.color : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? cfg.color : colors.textSecondary,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={updateMutation.isPending}
              activeOpacity={0.8}
              style={{
                backgroundColor: primaryColor,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                opacity: updateMutation.isPending ? 0.5 : 1,
              }}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  Guardar Cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Reset Password Modal ─── */}
      <Modal visible={resetPwVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
              >
                Resetear Contrasena
              </Text>
              <TouchableOpacity onPress={() => setResetPwVisible(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {admin && (
              <View
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialIcons
                  name="person"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {admin.name}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginLeft: 8,
                  }}
                >
                  {admin.email}
                </Text>
              </View>
            )}

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Nueva contrasena
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimo 6 caracteres"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 20,
              }}
            />

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                opacity: resetPasswordMutation.isPending ? 0.5 : 1,
              }}
            >
              {resetPasswordMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  Resetear Contrasena
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
