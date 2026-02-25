import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface ActionItemProps {
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
}

const ActionItem: React.FC<ActionItemProps> = React.memo(({
  label,
  iconName,
  onPress,
}) => {
  return (
    <View className="flex-row items-center justify-end mb-5">
      <View className="bg-zinc-800 py-2 px-3 rounded-lg mr-4">
        <Text className="text-white text-sm font-semibold">{label}</Text>
      </View>
      <TouchableOpacity
        className="w-12 h-12 rounded-full justify-center items-center shadow-md"
        style={{ backgroundColor: "#FFF", shadowColor: "rgba(0,0,0,0.15)" }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name={iconName} size={24} color="#1A1A1A" />
      </TouchableOpacity>
    </View>
  );
});

export default ActionItem;
