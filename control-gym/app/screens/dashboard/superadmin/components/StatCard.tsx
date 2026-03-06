import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface StatCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  subtitle: string;
  accentColor: string;
}

export const StatCard = ({
  icon,
  label,
  value,
  subtitle,
  accentColor,
}: StatCardProps) => {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        shadowColor: isDark ? "transparent" : "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${accentColor}15`,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <MaterialIcons name={icon} size={20} color={accentColor} />
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: "800",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            backgroundColor: `${accentColor}15`,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: accentColor, fontSize: 10, fontWeight: "700" }}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
};
