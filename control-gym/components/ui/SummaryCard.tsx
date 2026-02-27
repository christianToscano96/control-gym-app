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
  const { primaryColor, colors } = useTheme();

  const isNegative = persent?.startsWith("-");
  const badgeBgColor = isNegative ? "#FEE2E2" : "#DCFCE7";
  const badgeTextColor = isNegative ? "#DC2626" : primaryColor;
  const prefix = isNegative ? "" : "+";

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="flex-1 rounded-2xl p-5 my-2 shadow-sm shadow-black/5 mb-1 "
    >
      <View className="flex flex-row items-center justify-between mb-2">
        <MaterialIcons name={icon as any} size={24} color={primaryColor} />

        <View
          style={{ backgroundColor: badgeBgColor }}
          className="px-2 py-1 rounded"
        >
          <Text style={{ color: badgeTextColor, fontWeight: "bold" }}>
            {prefix}{persent || "0%"}
          </Text>
        </View>
      </View>
      <View>
        <Text style={{ color: colors.textSecondary }} className="text-lg">
          {title || "Members"}
        </Text>
        <Text style={{ color: colors.text }} className="text-3xl font-bold">
          {value || "1234"}
        </Text>
      </View>
    </View>
  );
};
