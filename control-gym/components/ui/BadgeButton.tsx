import React, { useMemo } from "react";
import { Text, Pressable } from "react-native";

interface BadgeProps {
  label: string;
  onPress?: () => void;
  isSelected?: boolean;
}

const BadgeButton = ({ label, onPress, isSelected = true }: BadgeProps) => {
  const buttonClassName = useMemo(
    () =>
      `border-2 ${isSelected ? "border-green-400" : "border-slate-300"} bg-green-50/30 rounded-full px-8 py-2 active:opacity-70 self-start`,
    [isSelected],
  );

  return (
    <Pressable onPress={onPress} className={buttonClassName}>
      <Text className="text-slate-900 text-lg font-semibold text-center">
        {label}
      </Text>
    </Pressable>
  );
};

export { BadgeButton };
export default BadgeButton;
