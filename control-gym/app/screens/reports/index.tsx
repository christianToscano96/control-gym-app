import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import {
  useDashboardStatsQuery,
  useSnapshotsQuery,
  useActivityRateQuery,
  useExpiringMembershipsQuery,
} from "@/hooks/queries/useDashboard";
import { exportClientsCSV, exportPaymentsCSV, exportAttendanceCSV } from "@/api/exports";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queries/queryKeys";

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const ReportsScreen = () => {
  const { colors, primaryColor, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [exportingKey, setExportingKey] = useState<string | null>(null);

  const { data: stats, isLoading: loadingStats } = useDashboardStatsQuery();
  const { data: snapshots, isLoading: loadingSnapshots } = useSnapshotsQuery();
  const { data: activityRate } = useActivityRateQuery();
  const { data: expiring } = useExpiringMembershipsQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
      queryClient.invalidateQueries({ queryKey: queryKeys.snapshots.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activityRate }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.expiringMemberships }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const handleExport = async (key: string, fn: () => Promise<void>, label: string) => {
    setExportingKey(key);
    try {
      await fn();
    } catch (err: any) {
      Alert.alert("Error", err?.message || `No se pudo exportar ${label}`);
    } finally {
      setExportingKey(null);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-AR")}`;
  };

  const recentSnapshots = (snapshots || [])
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, 6);

  const isLoading = loadingStats && loadingSnapshots;

  const kpis = [
    {
      icon: "attach-money" as const,
      label: "Ingresos del mes",
      value: stats ? formatCurrency(stats.monthlyRevenue) : "—",
      percent: stats?.revenuePercent || "",
      color: "#10B981",
    },
    {
      icon: "people" as const,
      label: "Clientes activos",
      value: stats ? String(stats.totalClients) : "—",
      percent: stats?.clientsPercent || "",
      color: primaryColor,
    },
    {
      icon: "speed" as const,
      label: "Tasa de actividad",
      value: activityRate ? `${activityRate.activityRate}%` : "—",
      percent: "",
      color: "#8B5CF6",
    },
    {
      icon: "warning" as const,
      label: "Membresías por vencer",
      value: expiring ? String(expiring.count) : "—",
      percent: "",
      color: "#F59E0B",
    },
  ];

  const exportOptions = [
    { key: "clients", label: "Clientes", desc: "Listado completo de clientes", icon: "people" as const, fn: exportClientsCSV },
    { key: "payments", label: "Pagos", desc: "Historial de pagos recibidos", icon: "payments" as const, fn: exportPaymentsCSV },
    { key: "attendance", label: "Asistencias", desc: "Registro de entradas al gimnasio", icon: "login" as const, fn: exportAttendanceCSV },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
            Reportes
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            Resumen y exportación de datos
          </Text>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* KPI Cards */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  paddingHorizontal: 4,
                }}
              >
                Mes actual
              </Text>
              <View style={{ gap: 10 }}>
                {kpis.map((kpi) => (
                  <View
                    key={kpi.label}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: isDark ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isDark ? kpi.color + "20" : kpi.color + "14",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <MaterialIcons name={kpi.icon} size={22} color={kpi.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                        {kpi.label}
                      </Text>
                      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>
                        {kpi.value}
                      </Text>
                    </View>
                    {kpi.percent ? (
                      <View
                        style={{
                          backgroundColor: kpi.percent.startsWith("-")
                            ? isDark ? "#DC262620" : "#FEE2E2"
                            : isDark ? "#10B98120" : "#D1FAE5",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: kpi.percent.startsWith("-") ? "#DC2626" : "#10B981",
                          }}
                        >
                          {kpi.percent}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>

            {/* Monthly Snapshots */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  paddingHorizontal: 4,
                }}
              >
                Resumen mensual
              </Text>

              {recentSnapshots.length === 0 ? (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 24,
                    alignItems: "center",
                    borderWidth: isDark ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  <MaterialIcons
                    name="bar-chart"
                    size={40}
                    color={colors.textSecondary}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
                    Aún no hay datos históricos.{"\n"}Los snapshots se generan al inicio de cada mes.
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    overflow: "hidden",
                    borderWidth: isDark ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  {recentSnapshots.map((snap, idx) => (
                    <View
                      key={`${snap.year}-${snap.month}`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: idx < recentSnapshots.length - 1 ? 1 : 0,
                        borderBottomColor: isDark ? "#ffffff10" : "#f1f5f9",
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: isDark ? primaryColor + "20" : primaryColor + "14",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: primaryColor,
                            textTransform: "uppercase",
                          }}
                        >
                          {MONTH_NAMES[snap.month - 1]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                          {MONTH_NAMES[snap.month - 1]} {snap.year}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                          {snap.totalClients} clientes · {snap.totalCheckIns} check-ins
                        </Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#10B981" }}>
                        {formatCurrency(snap.revenue)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Export Section */}
            <View style={{ paddingHorizontal: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  paddingHorizontal: 4,
                }}
              >
                Exportar datos
              </Text>
              <View style={{ gap: 10 }}>
                {exportOptions.map((opt) => {
                  const isExporting = exportingKey === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.7}
                      disabled={exportingKey !== null}
                      onPress={() => handleExport(opt.key, opt.fn, opt.label)}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: isDark ? 0 : 1,
                        borderColor: colors.border,
                        opacity: exportingKey !== null && !isExporting ? 0.5 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: isDark ? primaryColor + "20" : primaryColor + "14",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 14,
                        }}
                      >
                        <MaterialIcons name={opt.icon} size={22} color={primaryColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                          Exportar {opt.label}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                          {opt.desc}
                        </Text>
                      </View>
                      {isExporting ? (
                        <ActivityIndicator size="small" color={primaryColor} />
                      ) : (
                        <MaterialIcons name="file-download" size={22} color={primaryColor} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;
