import React, { useState } from "react";
import { View, Button, Alert, Text } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore, useMembershipStore } from "../stores/store";
import { apiClient } from "../api/client";

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
    if (!user) return;
    setLoading(true);
    try {
      await apiClient("/api/membership/change-plan", {
        method: "POST",
        body: { newPlan: plan },
      });
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
      <Text>Elige tu plan de membresía</Text>
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
