import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const SectionTitle = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {label}
    </Text>
  );
};

export const MiniStat = ({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) => {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: `${color}18`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{label}</Text>
    </View>
  );
};

export const InfoRow = ({
  icon,
  label,
  value,
  valueColor,
  noBorder,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  noBorder?: boolean;
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 11,
        borderBottomWidth: noBorder ? 0 : 1,
        borderBottomColor: `${colors.border}40`,
      }}
    >
      <MaterialIcons name={icon} size={18} color={colors.textSecondary} />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          marginLeft: 10,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor || colors.text,
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {value}
      </Text>
    </View>
  );
};
