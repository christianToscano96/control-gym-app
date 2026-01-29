import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { fetchClientById } from "@/api/clients";
import { useUserStore } from "@/stores/store";

const UserDetailsScreen = () => {
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

  return (
    <SafeAreaView className="flex-1 px-5">
      <View>
        <Text>Client Details Screen</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : clientData ? (
          <View>
            <Text>
              Nombre: {clientData.firstName + " " + clientData.lastName}
            </Text>
            <Text>Email: {clientData.email}</Text>
            <Text>Rol: {clientData.role}</Text>
            <Text>Activo: {clientData.active ? "Sí" : "No"}</Text>
          </View>
        ) : (
          <Text>No se encontró el cliente.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserDetailsScreen;
