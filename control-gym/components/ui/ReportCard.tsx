import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export interface ReportData {
  id: string;
  type: string;
  title: string;
  date: string;
  description?: string;
  status?: "completed" | "pending" | "error";
  metadata?: {
    totalRecords?: number;
    period?: string;
    [key: string]: any;
  };
}

interface ReportCardProps {
  report: ReportData;
  onPress?: () => void;
  onExport?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onPress,
  onExport,
}) => {
  const { colors, primaryColor } = useTheme();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "pending":
        return "Pendiente";
      case "error":
        return "Error";
      default:
        return "N/A";
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "clients":
        return "people";
      case "payments":
        return "payments";
      case "attendance":
        return "login";
      case "memberships":
        return "card-membership";
      case "revenue":
        return "attach-money";
      case "staff":
        return "badge";
      default:
        return "description";
    }
  };

  return (
    <TouchableOpacity
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: primaryColor + "20" }}
          >
            <MaterialIcons
              name={getReportIcon(report.type) as any}
              size={20}
              color={primaryColor}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-bold mb-1"
              style={{ color: colors.text }}
            >
              {report.title}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {report.date}
            </Text>
          </View>
        </View>

        {onExport && (
          <TouchableOpacity
            onPress={onExport}
            className="ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name="file-download"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {report.description && (
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
          {report.description}
        </Text>
      )}

      <View
        className="flex-row items-center justify-between mt-2 pt-2 border-t"
        style={{ borderTopColor: colors.border }}
      >
        <View className="flex-row items-center gap-3">
          {report.status && (
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getStatusColor(report.status) }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: getStatusColor(report.status) }}
              >
                {getStatusText(report.status)}
              </Text>
            </View>
          )}
          {report.metadata?.totalRecords !== undefined && (
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {report.metadata.totalRecords} registros
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
