import Badge from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Text, View } from "react-native";

export function GymHeaderCard({
  gymName,
  adminName,
  planLabel,
  planColor,
  planBg,
  statusLabel,
}: {
  gymName: string;
  adminName?: string | null;
  planLabel: string;
  planColor: string;
  planBg: string;
  statusLabel: string;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        padding: 16,
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>
        {gymName}
      </Text>
      {adminName ? (
        <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{adminName}</Text>
      ) : null}
      <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
        <View
          style={{
            backgroundColor: isDark ? `${planColor}25` : planBg,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: planColor, fontWeight: "700", fontSize: 12 }}>
            {planLabel}
          </Text>
        </View>
        <Badge label={statusLabel} />
      </View>
    </View>
  );
}
