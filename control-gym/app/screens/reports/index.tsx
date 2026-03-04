import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import SearchInput from "@/components/ui/SearchInput";
import Select, { SelectOption } from "@/components/ui/Select";
import ButtonCustom from "@/components/ui/ButtonCustom";
import ReportCard from "@/components/ui/ReportCard";
import EmptyState from "@/components/ui/EmptyState";
import {
  useReportsQuery,
  useExportReport,
} from "@/hooks/queries/useReportsQuery";
import {
  ReportData,
  ExportFormat,
  ReportsSummary,
} from "@/types/reports";

const statusOptions: SelectOption[] = [
  { label: "Todos los estados", value: "" },
  { label: "Completado", value: "completed" },
  { label: "En curso", value: "processing" },
  { label: "Error", value: "error" },
];

// ─── Summary Pill Component ────────────────────────────────────
const SummaryPill = ({
  label,
  count,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}) => (
  <View
    className="flex-1 rounded-xl py-2 px-3 items-center"
    style={{ backgroundColor: bgColor }}
  >
    <Text className="text-lg font-bold" style={{ color }}>
      {count}
    </Text>
    <Text className="text-xs" style={{ color }}>
      {label}
    </Text>
  </View>
);

// ─── Main Screen ────────────────────────────────────────────────
const ReportsScreen = () => {
  const { colors, primaryColor } = useTheme();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Export tracking
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // React Query hooks
  const {
    data: reports = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useReportsQuery();

  const exportMutation = useExportReport();

  const monthOptions: SelectOption[] = useMemo(() => {
    const options = reports
      .map((r) => ({
        label: String(r.metadata?.period || r.date),
        value: String(r.metadata?.monthKey || ""),
      }))
      .filter((item) => item.value);

    const unique = Array.from(
      new Map(options.map((item) => [item.value, item])).values(),
    );

    return [{ label: "Todos los meses", value: "" }, ...unique];
  }, [reports]);

  // Client-side filtering (all filters applied locally)
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Month filter (monthly closure)
    if (monthFilter) {
      filtered = filtered.filter((r) => r.metadata?.monthKey === monthFilter);
    }

    return filtered;
  }, [reports, searchQuery, statusFilter, monthFilter]);

  // Summary stats
  const summary: ReportsSummary = useMemo(
    () => ({
      total: reports.length,
      completed: reports.filter((r) => r.status === "completed").length,
      pending: reports.filter((r) => r.status === "pending").length,
      processing: reports.filter((r) => r.status === "processing").length,
      error: reports.filter((r) => r.status === "error").length,
    }),
    [reports],
  );

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setMonthFilter("");
    setStatusFilter("");
  };

  const handleExportReport = useCallback(
    async (report: ReportData, format: ExportFormat) => {
      setExportingId(report.id);
      try {
        await exportMutation.mutateAsync({ report, format });
      } finally {
        setExportingId(null);
      }
    },
    [exportMutation],
  );

  const handleReportPress = (report: ReportData) => {
    const buttons: any[] = [{ text: "Cerrar", style: "cancel" }];

    if (report.status === "completed") {
      buttons.push({
        text: "Exportar CSV",
        onPress: () => handleExportReport(report, "csv"),
      });
    }

    Alert.alert(
      report.title,
      `Mes: ${report.metadata?.period || report.date}\nFecha: ${report.date}\nEstado: ${report.status || "N/A"}\n${report.description || ""}`,
      buttons,
    );
  };

  const hasActiveFilters = !!searchQuery || !!statusFilter || !!monthFilter;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Reportes" isBackButton={false} />

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
        >
          {/* Summary Stats */}
          {!isLoading && reports.length > 0 && (
            <View className="flex-row gap-2 mb-4">
              <SummaryPill
                label="Total"
                count={summary.total}
                color={colors.textSecondary}
                bgColor={colors.card}
              />
              <SummaryPill
                label="OK"
                count={summary.completed}
                color="#10b981"
                bgColor="#10b98115"
              />
              {summary.processing > 0 && (
                <SummaryPill
                  label="En curso"
                  count={summary.processing}
                  color="#3b82f6"
                  bgColor="#3b82f615"
                />
              )}
            </View>
          )}

          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar reportes..."
            onClear={() => setSearchQuery("")}
          />

          {/* Filters */}
          <View className="mb-4">
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <Select
                  placeholder="Mes de cierre"
                  options={monthOptions}
                  value={monthFilter}
                  onChange={setMonthFilter}
                />
              </View>
              <View className="flex-1">
                <Select
                  placeholder="Estado"
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <ButtonCustom
                  title="Limpiar filtros"
                  onPress={handleClearFilters}
                  secondary
                  width="full"
                />
              </View>
              <View className="flex-1">
                <ButtonCustom
                  title={refreshing ? "Actualizando..." : "Actualizar datos"}
                  onPress={handleRefresh}
                  width="full"
                  disabled={refreshing || isLoading}
                />
              </View>
            </View>
          </View>

          {/* Error State */}
          {isError && (
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "#ef444415" }}
            >
              <Text
                className="text-sm text-center"
                style={{ color: "#ef4444" }}
              >
                {(error as Error)?.message || "Error al cargar los reportes"}
              </Text>
              <TouchableOpacity onPress={() => refetch()} className="mt-2">
                <Text
                  className="text-sm text-center font-bold"
                  style={{ color: primaryColor }}
                >
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reports List */}
          {isLoading ? (
            <View className="py-12">
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon="assessment"
              title="No hay reportes"
              description={
                hasActiveFilters
                  ? "No se encontraron reportes con los filtros aplicados"
                  : "Desliza hacia abajo para cargar los reportes"
              }
            />
          ) : (
            <FlatList
              data={filteredReports}
              renderItem={({ item: report }) => (
                <ReportCard
                  report={report}
                  onPress={() => handleReportPress(report)}
                  onExport={(format) => handleExportReport(report, format)}
                  isExporting={exportingId === report.id}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 24 }}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;
