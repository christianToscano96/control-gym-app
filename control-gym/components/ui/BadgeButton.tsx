import React from "react";
import { Text, Pressable } from "react-native";

interface BadgeProps {
  label: string;
  onPress?: () => void;
  isSelected?: boolean;
}

export const BadgeButton = React.memo(
  ({ label, onPress, isSelected = true }: BadgeProps) => {
    return (
      <Pressable
        onPress={onPress}
        className={`border-2 ${isSelected ? "border-green-400" : "border-slate-300"} bg-green-50/30 rounded-full px-8 py-2 active:opacity-70 self-start`}
      >
        <Text className="text-slate-900 text-lg font-semibold text-center">
          {label}
        </Text>
      </Pressable>
    );
  },
);
