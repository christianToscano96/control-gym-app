import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "../../stores/store";

export default function ConfigScreen() {
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Configuración</Text>
      <Text style={{ marginTop: 12, color: "#888" }}>
        Aquí podrás ajustar las opciones de la app.
      </Text>
      <Button title="Mi perfil" onPress={() => router.push("/profile")} />
      <Button
        title="Elegir membresía"
        onPress={() => router.push("/choose-membership")}
      />
      <View style={{ marginTop: 24, width: "100%" }}>
        <Button
          title="Cerrar sesión"
          color="#d32f2f"
          onPress={handleLogout}
          accessibilityLabel="Cerrar sesión"
        />
      </View>
    </View>
  );
}
