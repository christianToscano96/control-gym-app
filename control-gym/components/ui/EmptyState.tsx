import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title?: string;
  description?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title = "No hay datos",
  description = "No se encontraron resultados",
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View className={`items-center justify-center py-12 ${className || ""}`}>
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: colors.border + "40" }}
      >
        <MaterialIcons name={icon} size={40} color={colors.textSecondary} />
      </View>
      <Text
        className="text-lg font-bold mb-2 text-center"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="text-sm text-center px-8"
        style={{ color: colors.textSecondary }}
      >
        {description}
      </Text>
    </View>
  );
};

export default EmptyState;
