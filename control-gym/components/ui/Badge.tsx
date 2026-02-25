import React, { useMemo } from "react";
import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, color, backgroundColor }) => {
  // Si el label es 'Expirado', usa rojo, si no, verde
  const isExpired = label?.toLowerCase() === "inactivo";
  const badgeColor = useMemo(
    () => color || (isExpired ? "#DC2626" : "#059669"),
    [color, isExpired],
  );
  const badgeBg = useMemo(
    () => backgroundColor || (isExpired ? "#FECACA" : "#D1FAE5"),
    [backgroundColor, isExpired],
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
