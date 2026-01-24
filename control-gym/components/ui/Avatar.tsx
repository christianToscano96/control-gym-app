import React from "react";
import { View, Text, Image, ViewProps } from "react-native";

interface AvatarProps extends ViewProps {
  uri?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-20 h-20 text-xl",
};

function getInitials(name?: string) {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase() || "?";
  return (words[0][0] || "").toUpperCase() + (words[1][0] || "").toUpperCase();
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = "md",
  className = "",
  ...props
}) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  // Concatenar las clases manualmente
  const containerClass = [
    "rounded-full bg-gray-200 overflow-hidden items-center justify-center",
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View className={containerClass} {...props}>
      {uri ? (
        <Image source={{ uri }} className="w-full h-full object-cover" />
      ) : (
        <Text className="text-gray-700 font-bold">{getInitials(name)}</Text>
      )}
    </View>
  );
};

export default Avatar;
