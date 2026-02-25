import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import SearchInput from "@/components/ui/SearchInput";
import Select, { SelectOption } from "@/components/ui/Select";
import DateSelect from "@/components/ui/DateSelect";
import ButtonCustom from "@/components/ui/ButtonCustom";
import ReportCard, { ReportData } from "@/components/ui/ReportCard";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonReportsList } from "@/components/ui/skeletons";
import { API_BASE_URL } from "@/constants/api";
import { SafeAreaView } from "react-native-safe-area-context";
// TODO: Descomentar cuando se habilite la exportación con las dependencias
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";

const ReportsScreen = () => {
  const { colors, primaryColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  // Datos
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);

  // Opciones de filtros
  const reportTypeOptions: SelectOption[] = [
    { label: "Todos los reportes", value: "" },
    { label: "Clientes", value: "clients" },
    { label: "Pagos", value: "payments" },
    { label: "Asistencias", value: "attendance" },
    { label: "Membresías", value: "memberships" },
    { label: "Ingresos", value: "revenue" },
    { label: "Personal", value: "staff" },
  ];

  const statusOptions: SelectOption[] = [
    { label: "Todos los estados", value: "" },
    { label: "Completado", value: "completed" },
    { label: "Pendiente", value: "pending" },
    { label: "Error", value: "error" },
  ];

  // Cargar reportes iniciales (mock data o desde API)
  useEffect(() => {
    loadReports();
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...reports];

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filtro por tipo de reporte
    if (reportType) {
      filtered = filtered.filter((report) => report.type === reportType);
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // Filtro por rango de fechas
    if (startDate) {
      filtered = filtered.filter(
        (report) => new Date(report.date) >= startDate,
      );
    }
    if (endDate) {
      filtered = filtered.filter((report) => new Date(report.date) <= endDate);
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, reportType, startDate, endDate, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await fetch(`${API_BASE_URL}/reports`, {
      //   headers: {
      //     Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      //   },
      // });
      // const data = await response.json();

      // Mock data temporal
      const mockReports: ReportData[] = [
        {
          id: "1",
          type: "clients",
          title: "Reporte de Clientes",
          date: "2026-02-01",
          description: "Listado completo de clientes activos e inactivos",
          status: "completed",
          metadata: {
            totalRecords: 150,
            period: "Enero 2026",
          },
        },
        {
          id: "2",
          type: "payments",
          title: "Reporte de Pagos",
          date: "2026-02-03",
          description: "Detalle de todos los pagos recibidos",
          status: "completed",
          metadata: {
            totalRecords: 85,
            period: "Último mes",
          },
        },
        {
          id: "3",
          type: "attendance",
          title: "Reporte de Asistencias",
          date: "2026-02-04",
          description: "Registro de entradas y salidas del gimnasio",
          status: "completed",
          metadata: {
            totalRecords: 320,
            period: "Última semana",
          },
        },
        {
          id: "4",
          type: "memberships",
          title: "Reporte de Membresías",
          date: "2026-02-05",
          description: "Estado de todas las membresías activas",
          status: "pending",
          metadata: {
            totalRecords: 120,
            period: "Activo",
          },
        },
        {
          id: "5",
          type: "revenue",
          title: "Reporte de Ingresos",
          date: "2026-01-31",
          description: "Análisis de ingresos mensuales y anuales",
          status: "completed",
          metadata: {
            totalRecords: 45,
            period: "Enero 2026",
          },
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      Alert.alert("Error", "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setReportType("");
    setStartDate(null);
    setEndDate(null);
    setStatusFilter("");
  };

  const handleExportReport = async (report: ReportData) => {
    setExporting(report.id);
    try {
      // const token = await AsyncStorage.getItem("token");

      // Endpoint para exportar según el tipo de reporte
      const exportEndpoints: { [key: string]: string } = {
        clients: "/export/clients/csv",
        payments: "/export/payments/csv",
        attendance: "/export/attendance/csv",
        memberships: "/export/memberships/csv",
        revenue: "/export/revenue/csv",
        staff: "/export/staff/csv",
      };

      const endpoint = exportEndpoints[report.type] || "/export/report/pdf";
      const url = `${API_BASE_URL}${endpoint}`;

      // TODO: Implementar descarga y compartir con expo-file-system y expo-sharing
      // Por ahora, solo mostrar mensaje de éxito

      Alert.alert(
        "Exportar Reporte",
        `El reporte "${report.title}" se exportará desde:\n${url}\n\nPara habilitar la descarga, instala:\nnpx expo install expo-file-system expo-sharing`,
        [{ text: "OK" }],
      );

      // Código de descarga cuando se instalen las dependencias:
      /*
      const filename = `${report.type}_${Date.now()}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (downloadResult.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: "text/csv",
            dialogTitle: `Exportar ${report.title}`,
          });
        } else {
          Alert.alert("Éxito", `Reporte exportado a: ${downloadResult.uri}`);
        }
      }
      */
    } catch (error) {
      console.error("Error exportando reporte:", error);
      Alert.alert(
        "Error",
        "No se pudo exportar el reporte. Intenta nuevamente.",
      );
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    Alert.alert(
      "Exportar todos los reportes",
      "¿Deseas exportar todos los reportes filtrados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Exportar",
          onPress: async () => {
            setExporting("all");
            try {
              // TODO: Implementar exportación masiva
              for (const report of filteredReports) {
                await handleExportReport(report);
              }
              Alert.alert("Éxito", "Reportes exportados correctamente");
            } catch (exportError) {
              console.error("Error al exportar:", exportError);
              Alert.alert(
                "Error",
                "No se pudieron exportar todos los reportes",
              );
            } finally {
              setExporting(null);
            }
          },
        },
      ],
    );
  };

  const handleReportPress = (report: ReportData) => {
    Alert.alert(
      report.title,
      `Tipo: ${report.type}\nFecha: ${report.date}\n${report.description || ""}`,
      [
        { text: "Cerrar", style: "cancel" },
        {
          text: "Exportar",
          onPress: () => handleExportReport(report),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Reportes" isBackButton={false} />

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Barra de búsqueda */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar reportes..."
            onClear={() => setSearchQuery("")}
          />

          {/* Filtros */}
          <View className="mb-4">
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <Select
                  placeholder="Tipo de reporte"
                  options={reportTypeOptions}
                  value={reportType}
                  onChange={setReportType}
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

            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <DateSelect
                  placeholder="Fecha inicio"
                  value={startDate}
                  onChange={setStartDate}
                  maximumDate={endDate || new Date()}
                />
              </View>
              <View className="flex-1">
                <DateSelect
                  placeholder="Fecha fin"
                  value={endDate}
                  onChange={setEndDate}
                  minimumDate={startDate || undefined}
                  maximumDate={new Date()}
                />
              </View>
            </View>

            {/* Botones de acción */}
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
                  title="Exportar todo"
                  onPress={handleExportAll}
                  width="full"
                  disabled={filteredReports.length === 0 || exporting !== null}
                />
              </View>
            </View>
          </View>

          {/* Lista de reportes */}
          {loading ? (
            <SkeletonReportsList count={6} />
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon="assessment"
              title="No hay reportes"
              description="No se encontraron reportes con los filtros aplicados"
            />
          ) : (
            <FlatList
              data={filteredReports}
              renderItem={({ item: report }: { item: ReportData }) => (
                <ReportCard
                  report={report}
                  onPress={() => handleReportPress(report)}
                  onExport={() => handleExportReport(report)}
                />
              )}
              keyExtractor={(item: ReportData) => item.id}
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
