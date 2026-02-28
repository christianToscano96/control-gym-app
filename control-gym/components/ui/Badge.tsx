import React, { useMemo } from "react";
import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, color, backgroundColor }) => {
  const normalizedLabel = label?.toLowerCase();
  const isExpired = normalizedLabel === "inactivo";
  const isExpiring = normalizedLabel === "por vencer" || normalizedLabel === "vence mañana";
  const isUrgent = normalizedLabel === "vence hoy";

  const badgeColor = useMemo(
    () =>
      color ||
      (isExpired || isUrgent
        ? "#DC2626"
        : isExpiring
          ? "#D97706"
          : "#059669"),
    [color, isExpired, isExpiring, isUrgent],
  );
  const badgeBg = useMemo(
    () =>
      backgroundColor ||
      (isExpired || isUrgent
        ? "#FECACA"
        : isExpiring
          ? "#FEF3C7"
          : "#D1FAE5"),
    [backgroundColor, isExpired, isExpiring, isUrgent],
  );
  return (
    <View
      style={{
        backgroundColor: badgeBg,
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: badgeColor, fontWeight: "600", fontSize: 13 }}>
        {label}
      </Text>
    </View>
  );
};

export default Badge;
