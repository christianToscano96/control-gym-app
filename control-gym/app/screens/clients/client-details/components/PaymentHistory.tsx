import React from "react";
import { ActivityIndicator, Text, View, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  period?: string;
  status: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  primaryColor: string;
  loading?: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; darkBg: string }> = {
  completed: { color: "#10B981", bg: "#D1FAE5", darkBg: "#10B98120" },
  pending: { color: "#D97706", bg: "#FEF3C7", darkBg: "#D9770620" },
  failed: { color: "#DC2626", bg: "#FEE2E2", darkBg: "#DC262620" },
};

const statusLabels: Record<string, string> = {
  completed: "Completado",
  pending: "Pendiente",
  failed: "Fallido",
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  primaryColor,
  loading,
}) => {
  const { colors, isDark } = useTheme();

  const renderItem = ({
    item: payment,
    index,
  }: {
    item: Payment;
    index: number;
  }) => {
    const status = statusConfig[payment.status] || statusConfig.completed;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: index !== payments.length - 1 ? 1 : 0,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isDark ? primaryColor + "20" : primaryColor + "12",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons
              name={
                payment.method?.toLowerCase() === "efectivo"
                  ? "attach-money"
                  : "account-balance"
              }
              size={20}
              color={primaryColor}
            />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
            >
              ${payment.amount}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2, gap: 6 }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {new Date(payment.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              {payment.period && (
                <>
                  <View
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: colors.textSecondary,
                    }}
                  />
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {payment.period}
                  </Text>
                </>
              )}
            </View>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                fontWeight: "500",
              }}
            >
              {payment.method}
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
                backgroundColor: isDark ? status.darkBg : status.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: status.color,
                }}
              >
                {statusLabels[payment.status] || payment.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Historial de pagos
        </Text>
        {!loading && (
          <View
            style={{
              backgroundColor: isDark ? primaryColor + "20" : primaryColor + "12",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: primaryColor }}
            >
              {payments.length}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <ActivityIndicator size="small" color={primaryColor} />
          <Text
            style={{
              marginTop: 10,
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            Cargando pagos...
          </Text>
        </View>
      ) : payments.length > 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <FlatList
            data={payments}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons
            name="receipt-long"
            size={40}
            color={colors.textSecondary}
          />
          <Text
            style={{
              marginTop: 10,
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            No hay pagos registrados
          </Text>
        </View>
      )}
    </View>
  );
};
