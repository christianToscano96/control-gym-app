import { fetchClientById } from "@/api/clients";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

const UserDetailsScreen = () => {
  const { clientId } = useLocalSearchParams();
  const { user } = useUserStore();
  const { primaryColor } = useTheme();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token || !clientId) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchClientById(user.token, String(clientId));
        setClientData(data);

        // Mock payment data - replace with actual API call
        // const paymentsRes = await fetch(`${API_BASE_URL}/api/payments/${clientId}`, {...});
        setPayments([
          {
            _id: "1",
            amount: 50,
            date: "2026-01-15",
            method: "Efectivo",
            status: "Completado",
          },
          {
            _id: "2",
            amount: 50,
            date: "2025-12-15",
            method: "Transferencia",
            status: "Completado",
          },
          {
            _id: "3",
            amount: 50,
            date: "2025-11-15",
            method: "Efectivo",
            status: "Completado",
          },
        ]);
      } catch (err: any) {
        setError(err.message || "Error al obtener usuario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, user]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4 text-gray-500">Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white px-6">
        <HeaderTopScrenn title="Detalles" isBackButton />
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="error-outline" size={64} color="#DC2626" />
          <Text className="mt-4 text-red-600 text-center text-lg">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!clientData) {
    return (
      <SafeAreaView className="flex-1 bg-white px-6">
        <HeaderTopScrenn title="Detalles" isBackButton />
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="person-off" size={64} color="#94A3B8" />
          <Text className="mt-4 text-gray-500 text-center text-lg">
            No se encontró el cliente.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName =
    `${clientData.firstName || ""} ${clientData.lastName || ""}`.trim();
  const statusLabel = clientData.active ? "Activo" : "Inactivo";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 bg-white">
        <HeaderTopScrenn title="Detalles" isBackButton />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View className="bg-white items-center py-6 px-6 mb-3">
          <Avatar
            size="lg"
            uri={clientData.avatarUri}
            name={fullName}
            className="mb-3"
          />
          <Text className="text-xl font-bold text-neutral-900 mb-2">
            {fullName || "Sin nombre"}
          </Text>
          <Badge label={statusLabel} />
        </View>

        {/* Quick Info Card */}
        <View className="px-4 mb-3">
          <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <MaterialIcons name="email" size={18} color="#64748B" />
                <Text
                  className="text-sm text-gray-900 ml-2 flex-1"
                  numberOfLines={1}
                >
                  {clientData.email || "No registrado"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <MaterialIcons name="phone" size={18} color="#64748B" />
                <Text className="text-sm text-gray-900 ml-2">
                  {clientData.phone || "No registrado"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons
                  name="card-membership"
                  size={18}
                  color="#64748B"
                />
                <Text className="text-sm text-gray-900 ml-2">
                  {clientData.membershipType || "Básico"} •{" "}
                  {clientData.selected_period || "Mensual"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment History Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-neutral-900">
              Historial de Pagos
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: primaryColor }}
              >
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
                    index !== payments.length - 1
                      ? "border-b border-gray-100"
                      : ""
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
              <Text className="text-gray-500 mt-3">
                No hay pagos registrados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Action Button */}
      <View className="px-4 pb-8 flex-row gap-4 mt-2">
        <ButtonCustom
          title="Editar Cliente"
          onPress={() => {
            console.log("Editar clientee");
          }}
          width="flex"
        />
        <ButtonCustom
          title="Eliminar"
          secondary
          onPress={() => {
            console.log("Ver historial");
          }}
          width="flex"
        />
      </View>
    </SafeAreaView>
  );
};

export default UserDetailsScreen;
