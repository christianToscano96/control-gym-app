import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ItemClientProps {
  clientId: string;
  name: string;
  isActive: boolean;
  daysLeft?: number;
  membershipType?: string;
}

const EXPIRING_SOON_DAYS = 7;

const membershipLabels: Record<string, string> = {
  basico: "Básico",
  pro: "Pro",
  proplus: "Pro+",
};

const membershipColors: Record<string, { text: string; bg: string }> = {
  basico: { text: "#6366F1", bg: "#EEF2FF" },
  pro: { text: "#7C3AED", bg: "#F5F3FF" },
  proplus: { text: "#DB2777", bg: "#FDF2F8" },
};

const ItemClient = ({
  clientId,
  name,
  isActive,
  daysLeft,
  membershipType,
}: ItemClientProps) => {
  const { colors, isDark, primaryColor } = useTheme();

  const isExpiringSoon =
    isActive && daysLeft != null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS;
  const isUrgent = isActive && daysLeft != null && daysLeft <= 1;

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/screens/clients/client-details",
      params: { clientId },
    });
  }, [clientId]);

  const daysLabel = useMemo(() => {
    if (daysLeft == null || !isActive) return null;
    if (daysLeft < 0) return null;
    if (daysLeft === 0) return "Vence hoy";
    if (daysLeft === 1) return "Vence mañana";
    return `${daysLeft} días`;
  }, [daysLeft, isActive]);

  const statusColor = !isActive
    ? colors.error
    : isUrgent
      ? colors.error
      : isExpiringSoon
        ? colors.warning
        : colors.success;

  const membershipStyle = membershipType
    ? membershipColors[membershipType] || { text: primaryColor, bg: isDark ? "#1e293b" : "#F0FDF4" }
    : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
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
        <Avatar size="sm" name={name} />
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
            {name || "Sin nombre"}
          </Text>
          {membershipType && membershipStyle && (
            <View
              style={{
                backgroundColor: isDark ? `${membershipStyle.text}20` : membershipStyle.bg,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: isDark ? membershipStyle.text : membershipStyle.text,
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                {membershipLabels[membershipType] || membershipType}
              </Text>
            </View>
          )}
        </View>

        {/* Subtitle row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3, gap: 6 }}>
          {isActive && daysLabel ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <MaterialIcons
                name={isUrgent ? "error-outline" : isExpiringSoon ? "schedule" : "check-circle"}
                size={12}
                color={isUrgent ? colors.error : isExpiringSoon ? colors.warning : colors.textSecondary}
              />
              <Text
                style={{
                  color: isUrgent ? colors.error : isExpiringSoon ? colors.warning : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                {daysLabel}
              </Text>
            </View>
          ) : !isActive ? (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Membresía vencida
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right side: single badge */}
      <Badge label={isActive ? (isUrgent ? "Vence hoy" : isExpiringSoon ? "Por vencer" : "Activo") : "Inactivo"} />

      <MaterialIcons
        name="chevron-right"
        size={20}
        color={colors.textSecondary}
        style={{ marginLeft: 6, opacity: 0.6 }}
      />
    </TouchableOpacity>
  );
};

export default ItemClient;
