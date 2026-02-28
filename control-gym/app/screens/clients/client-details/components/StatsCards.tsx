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
  daysLeft,
}) => {
  const { colors, isDark } = useTheme();

  const expirationColor = hasExpired
    ? "#DC2626"
    : isExpiringSoon
      ? "#D97706"
      : primaryColor;
  const expirationBg = hasExpired
    ? isDark ? "#DC262615" : "#FEE2E2"
    : isExpiringSoon
      ? isDark ? "#D9770615" : "#FEF3C7"
      : isDark ? primaryColor + "15" : primaryColor + "12";

  const getDaysText = () => {
    if (daysLeft == null || hasExpired) return null;
    if (daysLeft < 0) return null;
    if (daysLeft === 0) return "Vence hoy";
    if (daysLeft === 1) return "Vence mañana";
    return `${daysLeft} días restantes`;
  };
  const daysText = getDaysText();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* Asistencia */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isDark ? primaryColor + "20" : primaryColor + "12",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <MaterialIcons name="fitness-center" size={20} color={primaryColor} />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 2,
            }}
          >
            {attendanceCount}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Asistencias este mes
          </Text>
        </View>

        {/* Vencimiento */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: expirationBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <MaterialIcons name="event" size={20} color={expirationColor} />
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: expirationColor,
              marginBottom: 2,
            }}
          >
            {expirationDateText}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {expirationLabel}
          </Text>
          {daysText && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
                gap: 4,
              }}
            >
              <MaterialIcons
                name={
                  daysLeft != null && daysLeft <= 1
                    ? "error"
                    : isExpiringSoon
                      ? "warning"
                      : "schedule"
                }
                size={12}
                color={expirationColor}
              />
              <Text style={{ fontSize: 11, color: expirationColor, fontWeight: "500" }}>
                {daysText}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
