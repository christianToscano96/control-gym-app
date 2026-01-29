import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
  return (
    <View className="px-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-neutral-900">
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
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/5">
          {payments.map((payment, index) => (
            <View
              key={payment._id}
              className={`flex-row items-center justify-between p-4 ${
                index !== payments.length - 1 ? "border-b border-gray-100" : ""
              }`}
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
                  <Text className="text-base font-semibold text-neutral-900">
                    ${payment.amount}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(payment.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-600 mb-1">
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
          ))}
        </View>
      ) : (
        <View className="bg-white rounded-2xl p-6 items-center shadow-sm shadow-black/5">
          <MaterialIcons name="receipt-long" size={48} color="#CBD5E1" />
          <Text className="text-gray-500 mt-3">No hay pagos registrados</Text>
        </View>
      )}
    </View>
  );
};
