import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import DateSelect from "@/components/ui/DateSelect";
import { useTheme } from "@/context/ThemeContext";
import { useCashClosureHistoryQuery } from "@/hooks/queries/useCashClosure";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RangeOption = "7d" | "30d" | "90d";

const rangeDays: Record<RangeOption, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateKey(dateKey: string) {
  return startOfDay(new Date(`${dateKey}T00:00:00`));
}

function formatCurrency(value: number) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function CashClosureHistoryScreen() {
  const { colors, primaryColor } = useTheme();
  const [range, setRange] = useState<RangeOption>("30d");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const {
    data: history = [],
    isLoading,
    isFetching,
    refetch,
  } = useCashClosureHistoryQuery(60);

  const filteredHistory = useMemo(() => {
    if (fromDate && toDate) {
      const from = startOfDay(fromDate);
      const to = startOfDay(toDate);
      const minDate = from <= to ? from : to;
      const maxDate = from <= to ? to : from;
      return history.filter((item) => {
        const itemDate = parseDateKey(item.dateKey);
        return itemDate >= minDate && itemDate <= maxDate;
      });
    }

    const days = rangeDays[range];
    const from = startOfDay(new Date());
    from.setDate(from.getDate() - (days - 1));

    return history.filter((item) => parseDateKey(item.dateKey) >= from);
  }, [history, range, fromDate, toDate]);

  const totals = useMemo(() => {
    return filteredHistory.reduce(
      (acc, item) => {
        acc.total += item.breakdown.total || 0;
        acc.expectedCash += item.expectedCash || 0;
        acc.countedCash += item.countedCash || 0;
        acc.difference += item.difference || 0;
        return acc;
      },
      { total: 0, expectedCash: 0, countedCash: 0, difference: 0 },
    );
  }, [filteredHistory]);

  const buildCsvContent = () => {
    const headers = [
      "fecha",
      "total_dia",
      "efectivo_esperado",
      "efectivo_contado",
      "diferencia",
      "transferencias",
      "tarjeta",
      "otros",
      "cerrado_por",
    ];

    const rows = filteredHistory.map((item) => {
      const closedBy = item.closedBy?.name || item.closedBy?.email || "";
      return [
        item.dateKey,
        item.breakdown.total || 0,
        item.expectedCash || 0,
        item.countedCash || 0,
        item.difference || 0,
        item.breakdown.transfer || 0,
        item.breakdown.card || 0,
        item.breakdown.other || 0,
        closedBy,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  const handleExportCsv = async () => {
    if (filteredHistory.length === 0) {
      Alert.alert("Sin datos", "No hay datos para exportar en este período.");
      return;
    }

    try {
      const csv = buildCsvContent();
      const filename = `cash-closure-${range}.csv`;

      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && typeof document !== "undefined") {
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
        Alert.alert("No disponible", "No se pudo descargar el archivo en web.");
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShareFile = await Sharing.isAvailableAsync();
      if (canShareFile) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Exportar historial de caja (CSV)",
        });
        return;
      }

      await Share.share({
        title: "Historial de caja (CSV)",
        message: csv,
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo exportar el CSV.");
    }
  };

  const buildPdfHtml = () => {
    const rowsHtml = filteredHistory
      .map((item) => {
        const closedBy = item.closedBy?.name || item.closedBy?.email || "Usuario";
        return `<tr>
          <td>${escapeHtml(item.dateKey)}</td>
          <td>${item.breakdown.total.toLocaleString("es-AR")}</td>
          <td>${item.expectedCash.toLocaleString("es-AR")}</td>
          <td>${item.countedCash.toLocaleString("es-AR")}</td>
          <td style="color:${item.difference >= 0 ? "#15803D" : "#DC2626"};font-weight:700;">${item.difference.toLocaleString("es-AR")}</td>
          <td>${item.breakdown.transfer.toLocaleString("es-AR")}</td>
          <td>${item.breakdown.card.toLocaleString("es-AR")}</td>
          <td>${item.breakdown.other.toLocaleString("es-AR")}</td>
          <td>${escapeHtml(closedBy)}</td>
        </tr>`;
      })
      .join("");

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 20px; color: #0F172A; }
      h1 { font-size: 20px; margin: 0 0 6px 0; }
      p { margin: 0 0 4px 0; color: #334155; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
      th, td { border: 1px solid #CBD5E1; padding: 6px; text-align: left; }
      th { background: #F1F5F9; }
    </style>
  </head>
  <body>
    <h1>Historial de Caja (${range})</h1>
    <p>Total facturado: ${formatCurrency(totals.total)}</p>
    <p>Efectivo esperado: ${formatCurrency(totals.expectedCash)}</p>
    <p>Efectivo contado: ${formatCurrency(totals.countedCash)}</p>
    <p>Diferencia acumulada: ${totals.difference >= 0 ? "+" : ""}${formatCurrency(totals.difference)}</p>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Total día</th>
          <th>Esperado</th>
          <th>Contado</th>
          <th>Diferencia</th>
          <th>Transfer.</th>
          <th>Tarjeta</th>
          <th>Otros</th>
          <th>Cerró</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </body>
</html>`;
  };

  const handleExportPdf = async () => {
    if (filteredHistory.length === 0) {
      Alert.alert("Sin datos", "No hay datos para exportar en este período.");
      return;
    }
    try {
      const html = buildPdfHtml();
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      const canShareFile = await Sharing.isAvailableAsync();
      if (canShareFile) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar historial de caja (PDF)",
        });
        return;
      }

      await Print.printAsync({ html });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo exportar el PDF.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 px-4" style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Historial de Caja" isBackButton />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {(["7d", "30d", "90d"] as RangeOption[]).map((option) => {
              const selected = option === range;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setRange(option)}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selected ? primaryColor : colors.border,
                    backgroundColor: selected ? `${primaryColor}20` : colors.card,
                    paddingVertical: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: selected ? primaryColor : colors.textSecondary,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {option === "7d" ? "7 días" : option === "30d" ? "30 días" : "90 días"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 13 }}>
              Filtro exacto
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              Selecciona desde/hasta. Si completas ambos, este rango reemplaza al filtro rápido.
            </Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <DateSelect
                  label="Desde"
                  value={fromDate}
                  onChange={setFromDate}
                  maximumDate={toDate || new Date()}
                  placeholder="Fecha desde"
                />
              </View>
              <View style={{ flex: 1 }}>
                <DateSelect
                  label="Hasta"
                  value={toDate}
                  onChange={setToDate}
                  minimumDate={fromDate || undefined}
                  maximumDate={new Date()}
                  placeholder="Fecha hasta"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setFromDate(null);
                setToDate(null);
              }}
              style={{
                marginTop: -2,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: "700", fontSize: 12 }}>
                Limpiar fechas
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 13 }}>
              Resumen del período
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Total facturado: {formatCurrency(totals.total)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Efectivo esperado: {formatCurrency(totals.expectedCash)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Efectivo contado: {formatCurrency(totals.countedCash)}
            </Text>
            <Text
              style={{
                color: totals.difference >= 0 ? "#15803D" : "#DC2626",
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              Diferencia acumulada: {totals.difference >= 0 ? "+" : ""}
              {formatCurrency(totals.difference)}
            </Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <TouchableOpacity
                onPress={handleExportCsv}
                disabled={filteredHistory.length === 0}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}18`,
                  alignItems: "center",
                  paddingVertical: 9,
                  opacity: filteredHistory.length === 0 ? 0.6 : 1,
                }}
              >
                <Text style={{ color: primaryColor, fontSize: 12, fontWeight: "800" }}>
                  Exportar CSV
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={filteredHistory.length === 0}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#334155",
                  backgroundColor: "#33415518",
                  alignItems: "center",
                  paddingVertical: 9,
                  opacity: filteredHistory.length === 0 ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#334155", fontSize: 12, fontWeight: "800" }}>
                  Exportar PDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View className="py-12">
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : filteredHistory.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                alignItems: "center",
              }}
            >
              <MaterialIcons name="event-busy" size={24} color={colors.textSecondary} />
              <Text style={{ color: colors.text, fontWeight: "700", marginTop: 8 }}>
                Sin cierres en este rango
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                Cambia el filtro o registra cierres diarios para ver el historial.
              </Text>
            </View>
          ) : (
            filteredHistory.map((item) => (
              <View
                key={item._id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "800", fontSize: 13 }}>
                    {item.dateKey}
                  </Text>
                  <Text
                    style={{
                      color: item.difference >= 0 ? "#15803D" : "#DC2626",
                      fontWeight: "800",
                      fontSize: 12,
                    }}
                  >
                    {item.difference >= 0 ? "+" : ""}
                    {formatCurrency(item.difference)}
                  </Text>
                </View>

                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                  Total: {formatCurrency(item.breakdown.total)} · Efectivo esperado: {formatCurrency(item.expectedCash)}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Transferencia: {formatCurrency(item.breakdown.transfer)} · Tarjeta: {formatCurrency(item.breakdown.card)}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Cerró: {item.closedBy?.name || item.closedBy?.email || "Usuario"}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
