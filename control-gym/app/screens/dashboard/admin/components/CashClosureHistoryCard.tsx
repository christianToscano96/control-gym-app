import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface CashHistoryItem {
  _id: string;
  dateKey: string;
  expectedCash: number;
  countedCash: number;
  difference: number;
  breakdown: { total: number };
}

interface Props {
  cashHistory: CashHistoryItem[];
  closureDeltaVsPrevious: number;
  lastClosed?: CashHistoryItem;
  previousClosed?: CashHistoryItem;
}

export function CashClosureHistoryCard({
  cashHistory,
  closureDeltaVsPrevious,
  lastClosed,
  previousClosed,
}: Props) {
  const { colors, primaryColor } = useTheme();

  return (
    <View className="px-2 mt-2">
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 10,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>
          Historial y comparativa
        </Text>

        <View
          style={{
            borderRadius: 10,
            backgroundColor: `${primaryColor}12`,
            padding: 10,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            Último cierre vs anterior
          </Text>
          <Text
            style={{
              color: closureDeltaVsPrevious >= 0 ? "#15803D" : "#DC2626",
              fontSize: 16,
              fontWeight: "800",
              marginTop: 2,
            }}
          >
            {closureDeltaVsPrevious >= 0 ? "+" : ""}$
            {Math.abs(closureDeltaVsPrevious).toLocaleString("es-AR")}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            {lastClosed && previousClosed
              ? `${lastClosed.dateKey} vs ${previousClosed.dateKey}`
              : "Aún no hay suficientes cierres para comparar"}
          </Text>
        </View>

        {cashHistory.slice(0, 4).map((item) => (
          <View
            key={item._id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <View>
              <Text
                style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}
              >
                {item.dateKey}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                Esperado: ${item.expectedCash.toLocaleString("es-AR")} · Contado: $
                {item.countedCash.toLocaleString("es-AR")}
              </Text>
            </View>
            <Text
              style={{
                color: item.difference >= 0 ? "#15803D" : "#DC2626",
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {item.difference >= 0 ? "+" : ""}$
              {Math.abs(item.difference).toLocaleString("es-AR")}
            </Text>
          </View>
        ))}

        {cashHistory.length === 0 && (
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Todavía no hay cierres registrados.
          </Text>
        )}
      </View>
    </View>
  );
}
