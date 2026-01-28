import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { fetchClientById } from "@/api/clients";
import { useUserStore } from "@/stores/store";

const UserDetailsScreen = () => {
  const { userId } = useLocalSearchParams();
  const { user } = useUserStore();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token || !userId) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchClientById(user.token, String(userId));
        setUserData(data);
      } catch (err: any) {
        setError(err.message || "Error al obtener usuario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, user]);

  return (
    <SafeAreaView className="flex-1 px-5">
      <View>
        <Text>User Details Screen</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : userData ? (
          <View>
            <Text>Nombre: {userData.name}</Text>
            <Text>Email: {userData.email}</Text>
            <Text>Rol: {userData.role}</Text>
            <Text>Activo: {userData.active ? "Sí" : "No"}</Text>
          </View>
        ) : (
          <Text>No se encontró el usuario.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserDetailsScreen;
