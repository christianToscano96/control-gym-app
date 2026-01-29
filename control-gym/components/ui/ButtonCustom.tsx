import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
  secondary?: boolean;
  tertiary?: boolean;
  isActive?: boolean;
  width?: "sm" | "md" | "lg" | "full" | "flex" | string;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  className,
  textClassName,
  secondary = false,
  tertiary = false,
  isActive = false,
  width = "full",
  children,
  ...props
}) => {
  const { primaryColor } = useTheme();

  let widthClass = "w-full";
  switch (width) {
    case "sm":
      widthClass = "w-32";
      break;
    case "md":
      widthClass = "w-48";
      break;
    case "lg":
      widthClass = "w-64";
      break;
    case "flex":
      widthClass = "flex-1";
      break;
    case "full":
      widthClass = "w-full";
      break;
    default:
      widthClass = width; // Permite clases custom como "w-1/2", "w-40", etc.
      break;
  }

  let sizeClass = "py-4";
  let textSizeClass = "text-base";

  if (width === "sm") {
    sizeClass = "py-2";
    textSizeClass = "text-sm";
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
  if (tertiary) {
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

  const handlePressIn = (e: any) => {
    if (tertiary) setPressed(true);
    if (props.onPressIn) props.onPressIn(e);
  };
  const handlePressOut = (e: any) => {
    if (tertiary) setPressed(false);
    if (props.onPressOut) props.onPressOut(e);
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
