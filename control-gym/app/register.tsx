import React, { useState } from "react";
import { View, TextInput, Button, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [plan, setPlan] = useState("basico");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminName,
          adminEmail,
          adminPassword,
          gymName,
          gymAddress,
          plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en el registro");
      Alert.alert("Éxito", "Cuenta y gimnasio creados correctamente");
      router.replace("/login");
    } catch (err) {
      let message = "No se pudo registrar";
      if (err instanceof Error) message = err.message;
      Alert.alert("Error", message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <TextInput
        placeholder="Nombre completo"
        value={adminName}
        onChangeText={setAdminName}
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Email"
        value={adminEmail}
        onChangeText={setAdminEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={adminPassword}
        onChangeText={setAdminPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Nombre del gimnasio"
        value={gymName}
        onChangeText={setGymName}
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Dirección del gimnasio"
        value={gymAddress}
        onChangeText={setGymAddress}
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Plan (basico, pro, proplus)"
        value={plan}
        onChangeText={setPlan}
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <Button title="Registrarse" onPress={handleRegister} />
    </ScrollView>
  );
}
