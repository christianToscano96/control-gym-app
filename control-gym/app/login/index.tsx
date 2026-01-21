import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserStore, useMembershipStore } from "@/store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useUserStore((s) => s.setUser);
  const setHasActiveMembership = useMembershipStore(
    (s) => s.setHasActiveMembership,
  );

  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Llamada real a la API de login
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Credenciales incorrectas");
      const data = await res.json();
      setUser(data.user);
      // Consultar membresía activa
      const membershipsRes = await fetch(
        "http://localhost:4000/api/membership",
        {
          headers: { Authorization: `Bearer ${data.token}` },
        },
      );
      const memberships = await membershipsRes.json();
      const hasMembership =
        Array.isArray(memberships) && memberships.some((m) => m.active);
      setHasActiveMembership(hasMembership);
      if (!hasMembership) {
        router.replace("/choose-membership");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      let message = "No se pudo iniciar sesión";
      if (err instanceof Error) message = err.message;
      Alert.alert("Error", message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
      <TouchableOpacity
        onPress={() => router.push("/login/register")}
        style={{ marginTop: 16, alignItems: "center" }}
      >
        <Text style={{ color: "#007bff" }}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
