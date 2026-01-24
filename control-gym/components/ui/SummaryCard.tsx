import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../constants/ThemeContext";

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
  const { primaryColor } = useTheme();

  return (
    <View className="flex-1 bg-white rounded-lg p-4 shadow mb-1 ">
      <View className="flex flex-row items-center justify-between mb-2">
        <MaterialIcons name={icon as any} size={24} color={primaryColor} />

        <View className="bg-green-100 px-2 py-1 rounded">
          <Text style={{ color: primaryColor, fontWeight: "bold" }}>
            +{persent || "12%"}
          </Text>
        </View>
      </View>
      <View>
        <Text className="text-lg color-gray-500">{title || "Members"}</Text>
        <Text className="text-3xl font-bold">{value || "1234"}</Text>
      </View>
    </View>
  );
};
