import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface RevenueCardProps {
  isLoading: boolean;
  totalRevenue: number;
}

export const RevenueCard = ({ isLoading, totalRevenue }: RevenueCardProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 4,
        marginVertical: 8,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        shadowColor: isDark ? "transparent" : "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "#10B98115",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="attach-money" size={24} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            INGRESOS TOTALES
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 28,
              fontWeight: "800",
              letterSpacing: -0.5,
            }}
          >
            {isLoading ? "..." : `$${totalRevenue.toLocaleString()}`}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#10B98115",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>
            Todos los gyms
          </Text>
        </View>
      </View>
    </View>
  );
};
