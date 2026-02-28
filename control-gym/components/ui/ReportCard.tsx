import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { ReportData, ExportFormat } from "@/types/reports";

interface ReportCardProps {
  report: ReportData;
  onPress?: () => void;
  onExport?: (format: ExportFormat) => void;
  isExporting?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onPress,
  onExport,
  isExporting = false,
}) => {
  const { colors, primaryColor } = useTheme();
  const [showFormatPicker, setShowFormatPicker] = useState(false);

  const statusConfig = useMemo(() => {
    switch (report.status) {
      case "completed":
        return { color: "#10b981", text: "Completado" };
      case "pending":
        return { color: "#f59e0b", text: "Pendiente" };
      case "processing":
        return { color: "#3b82f6", text: "Procesando..." };
      case "error":
        return { color: "#ef4444", text: "Error" };
      default:
        return { color: colors.textSecondary, text: "N/A" };
    }
  }, [report.status, colors.textSecondary]);

  const reportIcon = useMemo(() => {
    const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      clients: "people",
      payments: "payments",
      attendance: "login",
      memberships: "card-membership",
      revenue: "attach-money",
      staff: "badge",
      peak_hour: "schedule",
      general: "description",
    };
    return iconMap[report.type] || "description";
  }, [report.type]);

  const formattedDate = useMemo(() => {
    try {
      const date = new Date(report.date);
      return date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return report.date;
    }
  }, [report.date]);

  const isExportable = report.status === "completed";

  const handleExportPress = () => {
    if (!isExportable) return;
    setShowFormatPicker(!showFormatPicker);
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setShowFormatPicker(false);
    onExport?.(format);
  };

  return (
    <TouchableOpacity
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: primaryColor + "20" }}
          >
            <MaterialIcons name={reportIcon} size={20} color={primaryColor} />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-bold mb-1"
              style={{ color: colors.text }}
            >
              {report.title}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {formattedDate}
            </Text>
          </View>
        </View>

        {onExport && (
          <TouchableOpacity
            onPress={handleExportPress}
            className="ml-2"
            disabled={isExporting || !isExportable}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <MaterialIcons
                name="file-download"
                size={24}
                color={isExportable ? colors.textSecondary : colors.border}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {report.description && (
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
          {report.description}
        </Text>
      )}

      {/* Format picker */}
      {showFormatPicker && isExportable && (
        <View className="flex-row gap-2 mb-2 mt-1">
          {(["csv", "pdf"] as ExportFormat[]).map((fmt) => (
            <TouchableOpacity
              key={fmt}
              className="flex-row items-center px-3 py-2 rounded-xl"
              style={{ backgroundColor: primaryColor + "15" }}
              onPress={() => handleFormatSelect(fmt)}
            >
              <MaterialIcons
                name={fmt === "csv" ? "table-chart" : "picture-as-pdf"}
                size={16}
                color={primaryColor}
              />
              <Text
                className="text-xs font-bold ml-1 uppercase"
                style={{ color: primaryColor }}
              >
                {fmt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer */}
      <View
        className="flex-row items-center justify-between mt-2 pt-2 border-t"
        style={{ borderTopColor: colors.border }}
      >
        <View className="flex-row items-center gap-3">
          {report.status && (
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: statusConfig.color }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.text}
              </Text>
            </View>
          )}
          {report.metadata?.totalRecords !== undefined && (
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {report.metadata.totalRecords.toLocaleString()} registros
            </Text>
          )}
        </View>
        {report.metadata?.period && (
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {report.metadata.period}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ReportCard;
