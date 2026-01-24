import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ChipProps extends TouchableOpacityProps {
  label: string;
  primary?: boolean;
  secondary?: boolean;
  className?: string;
  textClassName?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  primary = false,
  secondary = false,
  className,
  textClassName,
  ...props
}) => {
  const primaryClass =
    "px-4 py-1 bg-[#13ec5b] rounded-full border border-[#13ec5b] items-center justify-center self-start";
  const secondaryClass =
    "px-4 py-1 bg-white rounded-full border border-[#13ec5b] items-center justify-center self-start";
  const primaryTextClass = "text-dark-blue font-semibold text-sm";
  const secondaryTextClass = "text-[#13ec5b] font-semibold text-sm";

  const chipClass = className || (secondary ? secondaryClass : primaryClass);
  const chipTextClass =
    textClassName || (secondary ? secondaryTextClass : primaryTextClass);

  return (
    <TouchableOpacity className={chipClass} activeOpacity={0.8} {...props}>
      <Text className={chipTextClass}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Chip;
