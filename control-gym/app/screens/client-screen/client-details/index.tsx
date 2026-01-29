import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchClientById } from "@/api/clients";
import { useUserStore } from "@/stores/store";
import HeaderTop from "@/components/ui/HeaderTop";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const UserDetailsScreen = () => {
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const { user } = useUserStore();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token || !clientId) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchClientById(user.token, String(clientId));
        setClientData(data);
      } catch (err: any) {
        setError(err.message || "Error al obtener usuario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, user]);

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEdit = () => {
    Alert.alert("Editar", "Función de edición en desarrollo");
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Cliente",
      "¿Estás seguro de que quieres eliminar este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => {} },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderTop title="Detalles del Cliente" icon="arrow-back" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#13ec5b" />
          <Text className="mt-4 text-gray-600">Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderTop title="Detalles del Cliente" icon="arrow-back" />
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color="#EF4444"
          />
          <Text className="mt-4 text-lg font-semibold text-gray-800">
            Error
          </Text>
          <Text className="mt-2 text-center text-gray-600">{error}</Text>
          <ButtonCustom
            title="Reintentar"
            className="mt-6"
            sm
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!clientData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <HeaderTop title="Detalles del Cliente" icon="arrow-back" />
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons
            name="account-off"
            size={64}
            color="#9CA3AF"
          />
          <Text className="mt-4 text-lg font-semibold text-gray-800">
            Cliente no encontrado
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            No se pudo encontrar la información de este cliente
          </Text>
          <ButtonCustom
            title="Volver"
            className="mt-6"
            sm
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <HeaderTop title="Detalles del Cliente" icon="arrow-back" />
      <ScrollView className="flex-1 px-1" showsVerticalScrollIndicator={false}>
        {/* Header con Avatar y Nombre */}
        <View className="items-center pt-6 pb-4">
          <Avatar
            name={`${clientData.firstName} ${clientData.lastName}`}
            size="lg"
            uri={clientData.avatarUri}
          />
          <Text className="mt-4 text-2xl font-bold text-gray-900">
            {clientData.firstName} {clientData.lastName}
          </Text>
          <View className="mt-3">
            <Badge label={clientData.active ? "Activo" : "Inactivo"} />
          </View>
        </View>

        {/* Información de Contacto */}
        <View className="mt-6 bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Información de Contacto
          </Text>

          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <MaterialCommunityIcons name="email" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 uppercase">Email</Text>
              <Text className="text-base text-gray-900">
                {clientData.email}
              </Text>
            </View>
          </View>

          {clientData.phone && (
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase">
                  Teléfono
                </Text>
                <Text className="text-base text-gray-900">
                  {clientData.phone}
                </Text>
              </View>
            </View>
          )}

          {clientData.instagramLink && (
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="instagram"
                  size={20}
                  color="#EC4899"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase">
                  Instagram
                </Text>
                <Text className="text-base text-gray-900">
                  {clientData.instagramLink}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Información de Membresía */}
        <View className="mt-4 bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Membresía
          </Text>

          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
              <MaterialCommunityIcons name="crown" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 uppercase">
                Tipo de Plan
              </Text>
              <Text className="text-base text-gray-900 capitalize">
                {clientData.membershipType || "N/A"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <MaterialCommunityIcons
                name="calendar-start"
                size={20}
                color="#10B981"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 uppercase">
                Fecha de Inicio
              </Text>
              <Text className="text-base text-gray-900">
                {formatDate(clientData.startDate)}
              </Text>
            </View>
          </View>

          {clientData.endDate && (
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="calendar-end"
                  size={20}
                  color="#EF4444"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase">
                  Fecha de Expiración
                </Text>
                <Text className="text-base text-gray-900">
                  {formatDate(clientData.endDate)}
                </Text>
              </View>
            </View>
          )}

          {clientData.selected_period && (
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#F97316"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase">Período</Text>
                <Text className="text-base text-gray-900">
                  {clientData.selected_period}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Información de Pago */}
        <View className="mt-4 bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Método de Pago
          </Text>

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3">
              <MaterialCommunityIcons
                name={
                  clientData.paymentMethod === "efectivo"
                    ? "cash"
                    : "bank-transfer"
                }
                size={20}
                color="#F59E0B"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 uppercase">Método</Text>
              <Text className="text-base text-gray-900 capitalize">
                {clientData.paymentMethod}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Botones de Acción */}
      <View className="mt-6 mb-8 flex-row gap-3 px-5">
        <View className="flex-1">
          <ButtonCustom title="Editar" onPress={handleEdit} />
        </View>
        <View className="flex-1">
          <ButtonCustom title="Eliminar" danger onPress={handleDelete} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserDetailsScreen;
