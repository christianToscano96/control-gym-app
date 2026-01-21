import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [plan, setPlan] = useState("basico");
  const [modalVisible, setModalVisible] = useState(false);
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
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          borderWidth: 1,
          marginBottom: 12,
          padding: 8,
          backgroundColor: "#f0f0f0",
        }}
      >
        <Text style={{ color: plan ? "#000" : "#888" }}>
          {plan ? `Plan: ${plan}` : "Selecciona un plan"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              minWidth: 250,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}
            >
              Selecciona un plan
            </Text>
            {["basico", "pro", "proplus"].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setPlan(p);
                  setModalVisible(false);
                }}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor: plan === p ? "#e0e0e0" : "#fafafa",
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Button title="Registrarse" onPress={handleRegister} />
      <Button title="Login" onPress={() => router.replace("/login")} />
    </ScrollView>
  );
}
