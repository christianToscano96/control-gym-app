import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  count: number;
}

export function DeniedCard({ count }: Props) {
  const { colors } = useTheme();

  if (count <= 0) return null;

  return (
    <View className="px-2 mb-1">
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#DC262630",
          shadowColor: "#DC2626",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#DC262615",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <MaterialIcons name="block" size={20} color="#DC2626" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: -0.5,
            }}
          >
            {count}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            RECHAZADOS HOY
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#FEE2E2",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#DC2626", fontSize: 10, fontWeight: "700" }}>
            Ingresos denegados
          </Text>
        </View>
      </View>
    </View>
  );
}
