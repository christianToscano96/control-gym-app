import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
  secondary?: boolean;
  tertiary?: boolean;
  danger?: boolean;
  isActive?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  className,
  textClassName,
  secondary = false,
  tertiary = false,
  danger = false,
  isActive = false,
  sm = false,
  md = false,
  lg = false,
  children,
  ...props
}) => {
  const { primaryColor } = useTheme();

  let widthClass = "w-full";
  if (sm) widthClass = "w-32";
  else if (md) widthClass = "w-48";
  else if (lg) widthClass = "w-64";

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
    `${widthClass}` +
    ` bg-[${primaryColor}]` +
    ` ${sizeClass} rounded-2xl items-center justify-center`;
  const secondaryClass =
    `${widthClass} bg-white border-2` +
    ` border-[${primaryColor}]` +
    ` ${sizeClass} rounded-2xl items-center justify-center`;
  const tertiaryClass = `${widthClass} bg-gray-200 border-2 border-gray-400 ${sizeClass} rounded-2xl items-center justify-center`;

  const primaryTextClass = `text-dark-blue font-bold ${textSizeClass} uppercase tracking-wider`;
  const secondaryTextClass = `text-[${primaryColor}] font-bold ${textSizeClass} uppercase tracking-wider`;
  const tertiaryTextClass = `text-gray-700 font-bold ${textSizeClass} uppercase tracking-wider`;

  let dynamicStyle = {};
  let textDynamicStyle = undefined;
  if (danger) {
    dynamicStyle = {
      backgroundColor: "#DC2626", // red-600
      borderRadius: 16,
    };
    textDynamicStyle = { color: "#fff" };
  } else if (tertiary) {
    dynamicStyle = {
      backgroundColor: "#e5e7eb", // gray-200
      borderColor: "#9ca3af", // gray-400
      borderWidth: 2,
      borderRadius: 16,
    };
    textDynamicStyle = { color: "#374151" }; // gray-700
  } else if (secondary) {
    dynamicStyle = {
      borderColor: primaryColor,
      borderWidth: 2,
      backgroundColor: "#fff",
      borderRadius: 16,
    };
    textDynamicStyle = { color: primaryColor };
  } else {
    dynamicStyle = { backgroundColor: primaryColor, borderRadius: 16 };
  }

  const [pressed, setPressed] = React.useState(false);

  const handlePressIn = () => {
    if (tertiary) setPressed(true);
    if (props.onPressIn) props.onPressIn();
  };
  const handlePressOut = () => {
    if (tertiary) setPressed(false);
    if (props.onPressOut) props.onPressOut();
  };

  if (tertiary && (pressed || isActive)) {
    dynamicStyle = {
      backgroundColor: "#111827", // black
      borderColor: "#111827",
      borderWidth: 2,
      borderRadius: 16,
    };
    textDynamicStyle = { color: "#fff" };
  }

  return (
    <TouchableOpacity
      className={
        className ||
        (tertiary ? tertiaryClass : secondary ? secondaryClass : primaryClass)
      }
      style={dynamicStyle}
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Text
        className={
          textClassName ||
          (tertiary
            ? tertiaryTextClass
            : secondary
              ? secondaryTextClass
              : primaryTextClass)
        }
        style={textDynamicStyle}
      >
        {title}
      </Text>
      {children}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
