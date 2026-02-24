import React from "react";
import { Text, View, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  primaryColor: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  primaryColor,
}) => {
  const { colors } = useTheme();

  const renderItem = ({ item: payment, index }: { item: Payment; index: number }) => (
    <View
      className="flex-row items-center justify-between p-4"
      style={{
        borderBottomWidth: index !== payments.length - 1 ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <MaterialIcons
            name={
              payment.method === "Efectivo"
                ? "attach-money"
                : "account-balance"
            }
            size={20}
            color={primaryColor}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text }}
          >
            ${payment.amount}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {new Date(payment.date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className="text-sm mb-1"
            style={{ color: colors.textSecondary }}
          >
            {payment.method}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#D1FAE5" }}
          >
            <Text className="text-xs font-semibold text-green-700">
              {payment.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="px-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Historial de Pagos
        </Text>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <Text className="text-sm font-bold" style={{ color: primaryColor }}>
            {payments.length} pagos
          </Text>
        </View>
      </View>

      {payments.length > 0 ? (
        <View
          className="rounded-2xl overflow-hidden shadow-sm shadow-black/5"
          style={{ backgroundColor: colors.card }}
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
          className="rounded-2xl p-6 items-center shadow-sm shadow-black/5"
          style={{ backgroundColor: colors.card }}
        >
          <MaterialIcons
            name="receipt-long"
            size={48}
            color={colors.textSecondary}
          />
          <Text className="mt-3" style={{ color: colors.textSecondary }}>
            No hay pagos registrados
          </Text>
        </View>
      )}
    </View>
  );
};
