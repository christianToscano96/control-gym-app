import React from "react";
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
  secondary?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  className,
  textClassName,
  secondary = false,
  sm = false,
  md = false,
  lg = false,
  children,
  ...props
}) => {
  let sizeClass = "py-4";
  let textSizeClass = "text-base";
  if (sm) {
    sizeClass = "py-2";
    textSizeClass = "text-sm";
  } else if (md) {
    sizeClass = "py-3";
    textSizeClass = "text-base";
  } else if (lg) {
    sizeClass = "py-5";
    textSizeClass = "text-lg";
  }

  const primaryClass = `w-full bg-[#13ec5b] ${sizeClass} rounded-2xl items-center justify-center`;
  const secondaryClass = `w-full bg-white border-2 border-[#13ec5b] ${sizeClass} rounded-2xl items-center justify-center`;
  const primaryTextClass = `text-dark-blue font-bold ${textSizeClass} uppercase tracking-wider`;
  const secondaryTextClass = `text-[#13ec5b] font-bold ${textSizeClass} uppercase tracking-wider`;

  return (
    <TouchableOpacity
      className={className || (secondary ? secondaryClass : primaryClass)}
      activeOpacity={0.9}
      {...props}
    >
      <Text
        className={
          textClassName || (secondary ? secondaryTextClass : primaryTextClass)
        }
      >
        {title}
      </Text>
      {children}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
