import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface SummaryCardProps {
  icon: string;
  title: string;
  value: string;
  persent: string;
}

export const SummaryCard = ({
  icon,
  title,
  value,
  persent,
}: SummaryCardProps) => {
  const { primaryColor, colors, isDark } = useTheme();

  const isNegative = persent?.startsWith("-");
  const badgeBgColor = isNegative ? "#FEE2E2" : `${primaryColor}15`;
  const badgeTextColor = isNegative ? "#DC2626" : primaryColor;
  const prefix = isNegative ? "" : "+";

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: isDark ? 0 : 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
      className="flex-1 rounded-2xl p-4 my-1"
    >
      {/* Icono */}
      <View
        style={{ backgroundColor: `${primaryColor}15` }}
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
      >
        <MaterialIcons name={icon as any} size={20} color={primaryColor} />
      </View>

      {/* Valor */}
      <Text
        style={{
          color: colors.text,
          fontSize: 28,
          fontWeight: "800",
          letterSpacing: -0.5,
        }}
      >
        {value || "0"}
      </Text>

      {/* Titulo + badge en una fila */}
      <View className="flex-row items-center justify-between mt-1">
        <Text
          style={{ color: colors.textSecondary, fontSize: 11 }}
          className="font-semibold uppercase tracking-wider"
        >
          {title || "—"}
        </Text>

        <View
          style={{ backgroundColor: badgeBgColor }}
          className="px-1.5 py-0.5 rounded-md"
        >
          <Text
            style={{
              color: badgeTextColor,
              fontWeight: "700",
              fontSize: 10,
            }}
          >
            {prefix}
            {persent || "0%"}
          </Text>
        </View>
      </View>
    </View>
  );
};
