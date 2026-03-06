import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  cashSummary: any;
  fetchingCashSummary: boolean;
  isMutationPending: boolean;
  onOpenModal: () => void;
  variant: "admin" | "staff";
}

export function CashClosureCard({
  cashSummary,
  fetchingCashSummary,
  isMutationPending,
  onOpenModal,
  variant,
}: Props) {
  const router = useRouter();
  const { colors, primaryColor } = useTheme();
  const disabled = fetchingCashSummary || isMutationPending;

  return (
    <View className="px-2 mt-3">
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "800" }}>
            Cierre de caja
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/dashboard/cash-closure-history" as any)
              }
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: colors.textSecondary,
                }}
              >
                Historial
              </Text>
            </TouchableOpacity>
            {variant === "admin" && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor:
                    cashSummary?.status === "closed" ? "#DCFCE7" : "#FEF3C7",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    color:
                      cashSummary?.status === "closed" ? "#166534" : "#92400E",
                  }}
                >
                  {cashSummary?.status === "closed" ? "CERRADA" : "ABIERTA"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Efectivo esperado: $
          {(cashSummary?.expectedCash ?? 0).toLocaleString("es-AR")}
        </Text>

        {variant === "admin" && (
          <>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Efectivo: $
              {(cashSummary?.breakdown?.cash ?? 0).toLocaleString("es-AR")} ·
              Transferencia: $
              {(cashSummary?.breakdown?.transfer ?? 0).toLocaleString("es-AR")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Tarjeta: $
              {(cashSummary?.breakdown?.card ?? 0).toLocaleString("es-AR")} ·
              Otros: $
              {(cashSummary?.breakdown?.other ?? 0).toLocaleString("es-AR")}
            </Text>
          </>
        )}

        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Total del día: $
          {(cashSummary?.breakdown?.total ?? 0).toLocaleString("es-AR")}
        </Text>

        {cashSummary?.status === "closed" && (
          <Text
            style={{
              color:
                (cashSummary?.closure?.difference ?? 0) >= 0
                  ? "#15803D"
                  : "#DC2626",
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            Diferencia registrada: $
            {(cashSummary?.closure?.difference ?? 0).toLocaleString("es-AR")}
          </Text>
        )}

        <TouchableOpacity
          disabled={disabled}
          onPress={onOpenModal}
          style={{
            marginTop: 4,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: primaryColor,
            paddingVertical: 10,
            alignItems: "center",
            backgroundColor: `${primaryColor}18`,
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <Text style={{ color: primaryColor, fontWeight: "800", fontSize: 12 }}>
            {cashSummary?.status === "closed"
              ? "Editar cierre de hoy"
              : "Cerrar caja del día"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
