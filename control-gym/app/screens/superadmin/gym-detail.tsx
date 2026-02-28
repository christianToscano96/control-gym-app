import React from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import {
  useGymDetailQuery,
  useToggleGymActive,
} from "@/hooks/queries/useSuperAdmin";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

// ─── Plan Config ─────────────────────────────────────────────
const planConfig: Record<string, { label: string; color: string; bg: string }> =
  {
    basico: { label: "Básico", color: "#6366F1", bg: "#EEF2FF" },
    pro: { label: "Pro", color: "#7C3AED", bg: "#F5F3FF" },
    proplus: { label: "Pro+", color: "#DB2777", bg: "#FDF2F8" },
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

export default function GymDetailScreen() {
  const { gymId } = useLocalSearchParams();
  const { colors, primaryColor, isDark } = useTheme();

  const {
    data,
    isLoading,
    error: queryError,
  } = useGymDetailQuery(gymId as string);

  const toggleMutation = useToggleGymActive();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={primaryColor} />
          <Text
            style={{
              marginTop: 16,
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            {queryError?.message || "No se encontró el gimnasio"}
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
    totalRevenue,
  } = data;
  const isActive = gym.active;
  const statusColor = isActive ? colors.success : colors.error;
  const plan = planConfig[gym.plan];

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getMembershipStatus = () => {
    if (!membership) return { label: "Sin plan", color: colors.error };
    const endDate = new Date(membership.endDate);
    const now = new Date();
    const daysLeft = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) return { label: "Expirado", color: colors.error };
    if (daysLeft <= 7)
      return { label: `${daysLeft} días restantes`, color: colors.warning };
    return { label: `${daysLeft} días restantes`, color: colors.success };
  };

  const membershipStatus = getMembershipStatus();

  const handleToggle = () => {
    const action = isActive ? "deshabilitar" : "habilitar";
    Alert.alert(
      `${isActive ? "Deshabilitar" : "Habilitar"} Gimnasio`,
      `¿Estás seguro de que deseas ${action} "${gym.name}"?${isActive ? "\n\nEl administrador deberá renovar su plan para volver a usar la app." : ""}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: isActive ? "Deshabilitar" : "Habilitar",
          style: isActive ? "destructive" : "default",
          onPress: () => {
            toggleMutation.mutate({
              gymId: gym._id,
              active: !isActive,
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Detalle Gimnasio" isBackButton />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ─── Header Card ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
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
            {/* Avatar + status dot */}
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

            {/* Gym name */}
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

            {/* Admin name */}
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

            {/* Badges row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
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
        </View>

        {/* ─── Stats Cards ─── */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 16,
            marginTop: 16,
          }}
        >
          {/* Clients card */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${primaryColor}15`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <MaterialIcons name="people" size={20} color={primaryColor} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 2,
              }}
            >
              {activeClientsCount}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Clientes activos
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {clientsCount} totales
            </Text>
          </View>

          {/* Revenue card */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#10B98115",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <MaterialIcons name="attach-money" size={20} color="#10B981" />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 2,
              }}
            >
              ${totalRevenue.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Ingresos totales
            </Text>
          </View>
        </View>

        {/* ─── Info Card: Plan & Membership ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
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
            Información del Plan
          </Text>
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
              label="Expiración"
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
              label="Dirección"
              value={gym.address || "—"}
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

        {/* ─── Toggle Button ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
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
              paddingVertical: 16,
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
                fontSize: 16,
              }}
            >
              {toggleMutation.isPending
                ? "Procesando..."
                : isActive
                  ? "Deshabilitar Gimnasio"
                  : "Habilitar Gimnasio"}
            </Text>
          </TouchableOpacity>

          {isActive && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                textAlign: "center",
                marginTop: 8,
                paddingHorizontal: 16,
              }}
            >
              Al deshabilitar, el administrador deberá renovar su plan para
              volver a usar la app.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
