import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface GymSubscriptionAlertProps {
  daysLeft: number;
  endDate: string;
  plan: string;
  onPress?: () => void;
}

const GymSubscriptionAlert: React.FC<GymSubscriptionAlertProps> = ({
  daysLeft,
  onPress,
}) => {
  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;
  const isCritical = daysLeft <= 3;

  const bgColor = isExpired ? "#FEE2E2" : isCritical ? "#FFF7ED" : "#FEF3C7";
  const accentColor = isExpired ? "#DC2626" : isCritical ? "#EA580C" : "#D97706";
  const textColor = isExpired ? "#991B1B" : isCritical ? "#9A3412" : "#92400E";

  const label = isExpired
    ? "Plan expirado"
    : daysLeft === 1
      ? "Tu plan vence mañana"
      : `Tu plan vence en ${daysLeft} días`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ backgroundColor: bgColor }}
      className="rounded-2xl px-4 py-3 mx-1 my-2 flex-row items-center"
    >
      <MaterialIcons
        name={isExpired ? "error" : "schedule"}
        size={20}
        color={accentColor}
      />
      <Text
        style={{ color: textColor }}
        className="text-sm font-semibold ml-2 flex-1"
      >
        {label}
      </Text>
      <View
        style={{ backgroundColor: accentColor }}
        className="rounded-lg px-3 py-1"
      >
        <Text className="text-white text-xs font-bold">
          {isExpired ? "Renovar" : "Ver plan"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default GymSubscriptionAlert;
