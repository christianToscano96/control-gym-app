import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
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
  basico: "Basico",
  pro: "Pro",
  proplus: "Pro+",
};

const ItemClient = ({
  clientId,
  name,
  isActive,
  daysLeft,
  membershipType,
}: ItemClientProps) => {
  const { colors, isDark } = useTheme();

  const isExpiringSoon =
    isActive && daysLeft != null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS;

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/screens/clients/client-details",
      params: { clientId },
    });
  }, [clientId]);

  const getDaysLabel = () => {
    if (daysLeft == null || !isActive) return null;
    if (daysLeft < 0) return null;
    if (daysLeft === 0) return "Vence hoy";
    if (daysLeft === 1) return "Vence mañana";
    return `Vence en ${daysLeft} días`;
  };

  const daysLabel = getDaysLabel();
  const isUrgent = isActive && daysLeft != null && daysLeft <= 1;
  const daysColor = isUrgent ? "#DC2626" : isExpiringSoon ? "#D97706" : colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        shadowColor: isDark ? "transparent" : "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <Avatar size="sm" name={name} />
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <Text
          style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}
          numberOfLines={1}
        >
          {name || "John Doe"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3, gap: 8 }}>
          {membershipType && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {membershipLabels[membershipType] || membershipType}
            </Text>
          )}
          {daysLabel && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name={isExpiringSoon ? "warning" : "schedule"}
                size={11}
                color={daysColor}
              />
              <Text style={{ color: daysColor, fontSize: 11, marginLeft: 3 }}>
                {daysLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Badge label={isActive ? "Activo" : "Inactivo"} />
        {isExpiringSoon && (
          <Badge label={isUrgent ? "Vence hoy" : "Por vencer"} />
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={colors.textSecondary}
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>
  );
};

export default ItemClient;
