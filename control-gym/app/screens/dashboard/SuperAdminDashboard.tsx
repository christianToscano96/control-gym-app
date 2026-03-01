import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import { useSuperAdminOverviewQuery } from "@/hooks/queries/useSuperAdmin";
import Header from "@/components/ui/Header";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { SuperAdminEntry } from "@/types/superadmin";

// ─── Plan Config ─────────────────────────────────────────────
const planConfig: Record<string, { label: string; color: string; bg: string }> =
  {
    basico: { label: "Básico", color: "#6366F1", bg: "#EEF2FF" },
    pro: { label: "Pro", color: "#7C3AED", bg: "#F5F3FF" },
    proplus: { label: "Pro+", color: "#DB2777", bg: "#FDF2F8" },
  };

type FilterStatus = "all" | "active" | "inactive";

// ─── GymAdminCard ────────────────────────────────────────────
const GymAdminCard = React.memo(
  ({ admin, onPress }: { admin: SuperAdminEntry; onPress?: () => void }) => {
    const { colors, isDark } = useTheme();
    const gym = admin.gym;
    const isActive = gym?.active ?? false;
    const statusColor = isActive ? colors.success : colors.error;
    const plan = gym ? planConfig[gym.plan] : null;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.65}
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          paddingLeft: 0,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          shadowColor: isDark ? "transparent" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          overflow: "hidden",
        }}
      >
        {/* Left accent bar */}
        <View
          style={{
            width: 3.5,
            height: 36,
            backgroundColor: statusColor,
            borderRadius: 2,
            marginLeft: 4,
            marginRight: 10,
          }}
        />

        {/* Avatar with status dot */}
        <View>
          <Avatar size="sm" name={admin.name} uri={admin.avatar} />
          <View
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 11,
              height: 11,
              borderRadius: 6,
              backgroundColor: statusColor,
              borderWidth: 2,
              borderColor: colors.card,
            }}
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
          {/* Row 1: Gym name + plan badge */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: "600",
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {gym?.name || "Sin gimnasio"}
            </Text>
            {plan && (
              <View
                style={{
                  backgroundColor: isDark ? `${plan.color}20` : plan.bg,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: plan.color,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  {plan.label}
                </Text>
              </View>
            )}
          </View>

          {/* Row 2: Admin name + client count */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 3,
              gap: 6,
            }}
          >
            <MaterialIcons
              name="person"
              size={12}
              color={colors.textSecondary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "500",
              }}
              numberOfLines={1}
            >
              {admin.name}
            </Text>
            <Text style={{ color: colors.border, fontSize: 10 }}>|</Text>
            <MaterialIcons
              name="people"
              size={12}
              color={colors.textSecondary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {gym?.clientsCount ?? 0} clientes
            </Text>
          </View>
        </View>

        {/* Right side: Status badge + chevron */}
        <Badge label={isActive ? "Activo" : "Inactivo"} />
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.textSecondary}
          style={{ marginLeft: 6, opacity: 0.6 }}
        />
      </TouchableOpacity>
    );
  },
);

// ─── StatCard (inline, lightweight) ──────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  subtitle,
  accentColor,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  subtitle: string;
  accentColor: string;
}) => {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        shadowColor: isDark ? "transparent" : "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${accentColor}15`,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <MaterialIcons name={icon} size={20} color={accentColor} />
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: "800",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            backgroundColor: `${accentColor}15`,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: accentColor, fontSize: 10, fontWeight: "700" }}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const { colors, primaryColor, isDark } = useTheme();
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
      filtered = filtered.filter((a) => a.gym?.active === true);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((a) => !a.gym?.active);
    }

    return filtered;
  }, [data?.admins, searchQuery, filterStatus]);

  const summary = data?.summary;

  const filterOptions: { key: FilterStatus; label: string; count?: number }[] =
    [
      { key: "all", label: "Todos", count: data?.admins?.length },
      { key: "active", label: "Activos", count: summary?.activeGyms },
      { key: "inactive", label: "Inactivos", count: summary?.inactiveGyms },
    ];

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
          {/* ─── Section Title ─── */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-wider px-2 mt-2 mb-1"
          >
            Panel Super Admin
          </Text>

          {/* ─── Revenue Card ─── */}
          <View
            style={{
              marginHorizontal: 4,
              marginVertical: 8,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
              shadowColor: isDark ? "transparent" : "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#10B98115",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="attach-money" size={24} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  INGRESOS TOTALES
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 28,
                    fontWeight: "800",
                    letterSpacing: -0.5,
                  }}
                >
                  {isLoading
                    ? "..."
                    : `$${(summary?.totalRevenue ?? 0).toLocaleString()}`}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#10B98115",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}
                >
                  Todos los gyms
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Summary Cards ─── */}
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

          {/* ─── Plan Distribution ─── */}
          <View className="flex-row gap-2 px-1 mb-4">
            {(["basico", "pro", "proplus"] as const).map((plan) => {
              const config = planConfig[plan];
              const count = summary?.planDistribution[plan] ?? 0;
              return (
                <View
                  key={plan}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? `${config.color}15` : config.bg,
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: config.color,
                      fontSize: 20,
                      fontWeight: "800",
                    }}
                  >
                    {isLoading ? "..." : count}
                  </Text>
                  <Text
                    style={{
                      color: config.color,
                      fontSize: 11,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {config.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ─── Search ─── */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar gimnasio o admin..."
            onClear={() => setSearchQuery("")}
          />

          {/* ─── Filter Chips ─── */}
          <View className="flex-row gap-2 mb-4">
            {filterOptions.map(({ key, label, count }) => {
              const isSelected = filterStatus === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setFilterStatus(key)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isSelected
                      ? primaryColor
                      : isDark
                        ? colors.card
                        : "#f1f5f9",
                    borderWidth: isSelected ? 0 : isDark ? 1 : 0,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#FFFFFF" : colors.textSecondary,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </Text>
                  {count != null && (
                    <View
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : `${primaryColor}15`,
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        minWidth: 22,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? "#FFFFFF" : primaryColor,
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── Result Count ─── */}
          {!isLoading && !isError && filteredAdmins.length > 0 && (
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs mb-2 px-1"
            >
              {filteredAdmins.length}{" "}
              {filteredAdmins.length === 1 ? "resultado" : "resultados"}
            </Text>
          )}

          {/* ─── List / States ─── */}
          {isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color={primaryColor} />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm mt-3"
              >
                Cargando datos...
              </Text>
            </View>
          ) : isError ? (
            <View
              style={{
                backgroundColor: isDark ? "#ef444415" : "#FEF2F2",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
              }}
            >
              <MaterialIcons name="error-outline" size={32} color="#ef4444" />
              <Text
                style={{ color: "#ef4444", marginTop: 8, textAlign: "center" }}
                className="text-sm font-medium"
              >
                {(error as Error)?.message || "Error al cargar datos"}
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                style={{
                  marginTop: 12,
                  backgroundColor: primaryColor,
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}
                >
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredAdmins.length === 0 ? (
            <EmptyState
              icon="store"
              title="No hay gimnasios"
              description={
                searchQuery || filterStatus !== "all"
                  ? "No se encontraron gimnasios con los filtros aplicados"
                  : "Aún no hay gimnasios registrados"
              }
            />
          ) : (
            filteredAdmins.map((admin) => (
              <GymAdminCard
                key={admin._id}
                admin={admin}
                onPress={() => {
                  if (admin.gym) {
                    router.push({
                      pathname: "/screens/superadmin/gym-detail",
                      params: { gymId: admin.gym._id },
                    } as any);
                  }
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
