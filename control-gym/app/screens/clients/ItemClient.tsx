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
}

const EXPIRING_SOON_DAYS = 7;

const ItemClient = ({
  clientId,
  name,
  isActive,
  daysLeft,
}: ItemClientProps) => {
  const { colors } = useTheme();

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
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      className="w-full rounded-2xl mb-3 border flex-row items-center p-3"
    >
      <Avatar size="sm" name={name} />
      <View className="flex-1 ml-3 mr-2">
        <Text
          style={{ color: colors.text }}
          className="text-base font-semibold"
          numberOfLines={1}
        >
          {name || "John Doe"}
        </Text>
        {daysLabel && (
          <View className="flex-row items-center mt-0.5">
            <MaterialIcons
              name={isExpiringSoon ? "warning" : "schedule"}
              size={11}
              color={daysColor}
            />
            <Text style={{ color: daysColor, fontSize: 11 }} className="ml-1">
              {daysLabel}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center gap-1.5">
        <Badge label={isActive ? "Activo" : "Inactivo"} />
        {isExpiringSoon && (
          <Badge label={isUrgent ? "Vence hoy" : "Por vencer"} />
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={colors.textSecondary}
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>
  );
};

export default ItemClient;
