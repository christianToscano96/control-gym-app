import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore, useMembershipStore } from "@/store";
import { ThemedText } from "@/components/themed-text";

const plans = [
  { key: "basico", label: "Básico (100 clientes)" },
  { key: "pro", label: "Pro (500 clientes)" },
  { key: "proplus", label: "Pro+ (clientes ilimitados)" },
];

export default function ChooseMembershipScreen() {
  const [loading, setLoading] = useState(false);
  const user = useUserStore((s) => s.user);
  const setHasActiveMembership = useMembershipStore(
    (s) => s.setHasActiveMembership,
  );
  const router = useRouter();

  const handleChoose = async (plan: string) => {
    if (!user || !(user as any).token) return;
    setLoading(true);
    try {
      // Llamada a la API para cambiar/crear membresía
      const res = await fetch(
        "http://localhost:4000/api/membership/change-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(user as any).token}`,
          },
          body: JSON.stringify({ newPlan: plan }),
        },
      );
      if (!res.ok) throw new Error("No se pudo cambiar la membresía");
      setHasActiveMembership(true);
      router.replace({ pathname: "/(tabs)" });
    } catch (err) {
      let message = "Error al elegir membresía";
      if (err instanceof Error) message = err.message;
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <ThemedText type="title">Elige tu plan de membresía</ThemedText>
      {plans.map((plan) => (
        <View key={plan.key} style={{ marginVertical: 12 }}>
          <Button
            title={plan.label}
            onPress={() => handleChoose(plan.key)}
            disabled={loading}
          />
        </View>
      ))}
    </View>
  );
}
