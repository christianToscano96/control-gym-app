import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface GymSubscriptionAlertProps {
  daysLeft: number;
  endDate: string;
  plan: string;
  onPress?: () => void;
}

const GymSubscriptionAlert: React.FC<GymSubscriptionAlertProps> = ({
  daysLeft,
  endDate,
  plan,
  onPress,
}) => {
  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;
  const isCritical = daysLeft <= 3;

  // Colors based on urgency
  const bgColor = isExpired ? "#FEE2E2" : isCritical ? "#FFF7ED" : "#FEF3C7";
  const iconBgColor = isExpired ? "#FECACA" : isCritical ? "#FED7AA" : "#FDE68A";
  const iconColor = isExpired ? "#DC2626" : isCritical ? "#EA580C" : "#D97706";
  const titleColor = isExpired ? "#991B1B" : isCritical ? "#9A3412" : "#92400E";
  const subtitleColor = isExpired ? "#B91C1C" : isCritical ? "#C2410C" : "#B45309";

  const planLabel =
    plan === "basico" ? "Básico" : plan === "pro" ? "Pro" : "Pro+";

  const formattedDate = new Date(endDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const title = isExpired
    ? `Tu plan ${planLabel} ha expirado`
    : daysLeft === 1
      ? `Tu plan ${planLabel} vence mañana`
      : `Tu plan ${planLabel} vence en ${daysLeft} días`;

  const subtitle = isExpired
    ? "Renueva tu plan para seguir usando la plataforma"
    : `Fecha de vencimiento: ${formattedDate}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ backgroundColor: bgColor }}
      className="rounded-2xl p-4 mx-1 my-2"
    >
      <View className="flex-row items-center">
        <View
          style={{ backgroundColor: iconBgColor }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
        >
          <MaterialIcons
            name={isExpired ? "error" : "schedule"}
            size={22}
            color={iconColor}
          />
        </View>
        <View className="flex-1">
          <Text style={{ color: titleColor }} className="text-sm font-bold">
            {title}
          </Text>
          <Text style={{ color: subtitleColor }} className="text-xs mt-0.5">
            {subtitle}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={iconColor} />
      </View>

      {isExpired && (
        <View
          style={{ backgroundColor: iconBgColor }}
          className="mt-3 rounded-xl p-3 flex-row items-center"
        >
          <MaterialIcons name="info-outline" size={16} color={titleColor} />
          <Text
            style={{ color: titleColor }}
            className="text-xs ml-2 flex-1 font-medium"
          >
            Tus servicios pueden ser suspendidos. Contacta soporte o renueva tu
            plan.
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GymSubscriptionAlert;
