import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface RevenueCardProps {
  value: string;
  percent: string;
  loading?: boolean;
}

export const RevenueCard = ({ value, percent, loading }: RevenueCardProps) => {
  const { primaryColor } = useTheme();

  const isNegative = percent?.startsWith("-");
  const prefix = isNegative ? "" : "+";

  return (
    <View
      style={{
        backgroundColor: primaryColor,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
      }}
      className="rounded-2xl p-5 my-2"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <MaterialIcons name="attach-money" size={20} color="#FFFFFF" />
          </View>
          <Text
            style={{ color: "rgba(255,255,255,0.95)" }}
            className="text-xs font-bold uppercase tracking-wider"
          >
            Ingresos del mes
          </Text>
        </View>

        {/* Badge porcentaje */}
        <View
          style={{
            backgroundColor: isNegative
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.2)",
          }}
          className="px-2.5 py-1 rounded-full"
        >
          <Text
            style={{
              color: isNegative ? "#FCA5A5" : "#FFFFFF",
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {prefix}
            {percent || "0%"}
          </Text>
        </View>
      </View>

      {/* Valor principal */}
      <Text
        style={{
          color: loading ? "rgba(255,255,255,0.5)" : "#FFFFFF",
          fontSize: 42,
          lineHeight: 48,
          fontWeight: "800",
          letterSpacing: -1,
        }}
      >
        {loading ? "..." : value}
      </Text>

      {/* Linea decorativa */}
      <View
        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        className="h-px mt-4 mb-2"
      />
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
        Comparado con el mes anterior
      </Text>
    </View>
  );
};
