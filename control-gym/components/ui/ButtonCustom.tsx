import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";

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
  const { primaryColor } = useTheme();

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

  const primaryClass =
    `w-full` +
    ` bg-[${primaryColor}]` +
    ` ${sizeClass} rounded-2xl items-center justify-center`;
  const secondaryClass =
    `w-full bg-white border-2` +
    ` border-[${primaryColor}]` +
    ` ${sizeClass} rounded-2xl items-center justify-center`;
  const primaryTextClass = `text-dark-blue font-bold ${textSizeClass} uppercase tracking-wider`;
  const secondaryTextClass = `text-[${primaryColor}] font-bold ${textSizeClass} uppercase tracking-wider`;

  // Estilos dinámicos para fondo y borde
  const dynamicStyle = secondary
    ? { borderColor: primaryColor, borderWidth: 2, backgroundColor: "#fff" }
    : { backgroundColor: primaryColor };

  return (
    <TouchableOpacity
      className={className || (secondary ? secondaryClass : primaryClass)}
      style={dynamicStyle}
      activeOpacity={0.9}
      {...props}
    >
      <Text
        className={
          textClassName || (secondary ? secondaryTextClass : primaryTextClass)
        }
        style={secondary ? { color: primaryColor } : undefined}
      >
        {title}
      </Text>
      {children}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
