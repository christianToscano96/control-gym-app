import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface StatsCardsProps {
  primaryColor: string;
  attendanceCount: number;
  expirationDateText: string;
  expirationLabel: string;
  hasExpired: boolean;
  isExpiringSoon: boolean;
  statusLabel: string;
  isActive: boolean;
  daysLeft?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  primaryColor,
  attendanceCount,
  expirationDateText,
  expirationLabel,
  hasExpired,
  isExpiringSoon,
  statusLabel,
  isActive,
  daysLeft,
}) => {
  const { colors } = useTheme();

  return (
    <View className="px-4 mb-3">
      <View className="flex flex-row gap-3 mb-3">
        {/* Asistencia Card */}
        <View
          className="flex-1 rounded-2xl p-4 shadow-sm shadow-black/5"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <MaterialIcons
                name="fitness-center"
                size={20}
                color={primaryColor}
              />
            </View>
          </View>
          <Text
            className="text-xs mb-1"
            style={{ color: colors.textSecondary }}
          >
            Asistencias
          </Text>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {attendanceCount}
          </Text>
          <Text
            className="text-xs mt-1"
            style={{ color: colors.textSecondary }}
          >
            Este mes
          </Text>
        </View>

        {/* Válido hasta Card */}
        <View
          className="flex-1 rounded-2xl p-4 shadow-sm shadow-black/5"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: hasExpired
                  ? "#FEE2E2"
                  : isExpiringSoon
                    ? "#FEF3C7"
                    : `${primaryColor}15`,
              }}
            >
              <MaterialIcons
                name="event"
                size={20}
                color={
                  hasExpired
                    ? "#DC2626"
                    : isExpiringSoon
                      ? "#D97706"
                      : primaryColor
                }
              />
            </View>
          </View>
          <Text
            className="text-xs mb-1"
            style={{ color: colors.textSecondary }}
          >
            {expirationLabel}
          </Text>
          <Text
            className="text-xs font-semibold leading-tight"
            style={{
              color: hasExpired
                ? "#DC2626"
                : isExpiringSoon
                  ? "#D97706"
                  : colors.text,
            }}
          >
            {expirationDateText}
          </Text>
          {!hasExpired && daysLeft != null && daysLeft >= 0 && (
            <View className="mt-1 flex-row items-center">
              <MaterialIcons
                name={daysLeft <= 1 ? "error" : isExpiringSoon ? "warning" : "schedule"}
                size={12}
                color={daysLeft <= 1 ? "#DC2626" : isExpiringSoon ? "#D97706" : colors.textSecondary}
              />
              <Text
                className="text-xs ml-1"
                style={{
                  color: daysLeft <= 1 ? "#DC2626" : isExpiringSoon ? "#D97706" : colors.textSecondary,
                }}
              >
                {daysLeft === 0
                  ? "Vence hoy"
                  : daysLeft === 1
                    ? "Vence mañana"
                    : `${daysLeft} días restantes`}
              </Text>
            </View>
          )}
        </View>

        {/* Estado Card */}
        <View
          className="flex-1 rounded-2xl p-4 shadow-sm shadow-black/5"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex flex-col items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isActive
                  ? isExpiringSoon
                    ? "#FEF3C7"
                    : "#D1FAE5"
                  : "#FEE2E2",
              }}
            >
              <MaterialIcons
                name={
                  isActive
                    ? isExpiringSoon
                      ? "warning"
                      : "check-circle"
                    : "cancel"
                }
                size={20}
                color={
                  isActive
                    ? isExpiringSoon
                      ? "#D97706"
                      : "#10B981"
                    : "#DC2626"
                }
              />
            </View>
            <View className="mt-3 flex-1">
              <Text
                className="text-xs mb-0.5"
                style={{ color: colors.textSecondary }}
              >
                Estado
              </Text>
              <Text
                className="text-base font-bold"
                style={{
                  color: isActive
                    ? isExpiringSoon
                      ? "#D97706"
                      : "#10B981"
                    : "#DC2626",
                }}
              >
                {isActive && isExpiringSoon ? "Por vencer" : statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
