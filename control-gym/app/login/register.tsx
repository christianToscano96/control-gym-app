import React, { useState } from "react";
import {
  View,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import ModalCustom from "../../components/ui/ModalCustom";
import TextField from "../../components/ui/TextField";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import ButtonCustom from "@/components/ui/ButtonCustom";
import Chip from "@/components/ui/Chip";
import { API_BASE_URL } from "../../constants/api";

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
      const res = await fetch(`${API_BASE_URL}/api/register`, {
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
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <ScrollView className="p-4 bg-white mb-4">
        <View className=" flex flex-row items-center mb-6 gap-4 border-b-2 pb-6 border-gray-100">
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#686868"
            onPress={() => router.replace("/login")}
          />
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Nueva cuenta</Text>
        </View>

        <View className="mb-4 p-4 mt-6">
          <TextField
            placeholder="Nombre completo"
            value={adminName}
            onChangeText={setAdminName}
          />
          <TextField
            placeholder="Email"
            value={adminEmail}
            onChangeText={setAdminEmail}
          />
          <TextField
            placeholder="Contraseña"
            value={adminPassword}
            onChangeText={setAdminPassword}
            secureTextEntry
          />
          <TextField
            placeholder="Nombre del gimnasio"
            value={gymName}
            onChangeText={setGymName}
          />
          <TextField
            placeholder="Dirección del gimnasio"
            value={gymAddress}
            onChangeText={setGymAddress}
          />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-full mb-4 py-3 px-4 rounded-2xl border-2 border-[#13ec5b] bg-slate-50 flex flex-row items-center justify-between"
            activeOpacity={0.85}
          >
            <Text
              className={
                plan
                  ? "text-dark-blue font-bold text-base"
                  : "text-gray-400 font-semibold text-base"
              }
            >
              {plan
                ? `Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}`
                : "Selecciona un plan"}
            </Text>
            <MaterialIcons
              name="expand-more"
              size={24}
              color={plan ? "#13ec5b" : "#94a3b8"}
            />
          </TouchableOpacity>
        </View>

        <ModalCustom
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="bg-gray-50 rounded-2xl p-6 w-full h-full pt-20">
            <View className="flex flex-row gap-2">
              <MaterialIcons
                name="arrow-back"
                size={24}
                color="#686868"
                onPress={() => setModalVisible(false)}
              />
              <Text
                style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}
              >
                Selecciona un plan
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {[
                {
                  nivel: "NIVEL 1",
                  price: "$15/mes",
                  title: "Plan Básico",
                  planKey: "basico",
                  features: [
                    "Capacidad: 100 clientes",
                    "2 administradores",
                    "Control de acceso QR",
                    "Reportes de flujo basico",
                  ],
                  style:
                    "mb-6 p-4 rounded-lg drop-shadow-3xl shadow-sm bg-white",
                  chip: null,
                  textClass: "text-gray-500",
                  titleClass: "text-3xl font-bold",
                  priceClass: "text-2xl font-bold",
                  buttonProps: { secondary: true, md: true },
                },
                {
                  nivel: "NIVEL 2",
                  price: "$25/mes",
                  title: "Plan Pro",
                  planKey: "pro",
                  features: [
                    "Capacidad: 500 clientes",
                    "4 administradores",
                    "Control de acceso Facial y Qr",
                    "Reportes de flujo Avanzado",
                  ],
                  style:
                    "mb-6 p-4 rounded-lg drop-shadow-3xl shadow-sm bg-white",
                  chip: <Chip label="Recomendado" primary />,
                  textClass: "text-gray-500",
                  titleClass: "text-3xl font-bold",
                  priceClass: "text-2xl font-bold",
                  buttonProps: { md: true },
                },
                {
                  nivel: "NIVEL 3",
                  price: "$50/mes",
                  title: "Plan Pro+",
                  planKey: "proplus",
                  features: [
                    "Capacidad Ilimitada de clientes",
                    "Multi-sede sincronizada",
                    "Control de acceso Facial y Qr",
                    "Reportes de flujo Avanzado y Multiples",
                  ],
                  style:
                    "mb-6 p-4 rounded-lg bg-[#1e293b] shadow-lg shadow-[#13ec5b] text-white",
                  chip: <Chip label="PREMIUM" primary />,
                  textClass: "text-white",
                  titleClass: "text-3xl font-bold text-white",
                  priceClass: "text-2xl font-bold text-white",
                  buttonProps: { md: true },
                },
              ].map((planItem, idx) => (
                <View key={planItem.nivel} className={planItem.style}>
                  <View className="mb-2 flex-row justify-between items-center">
                    <Text className={`font-semibold ${planItem.textClass}`}>
                      {planItem.nivel}
                    </Text>
                    <Text className={planItem.priceClass}>
                      {planItem.price}
                    </Text>
                  </View>
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className={planItem.titleClass}>
                      {planItem.title}
                    </Text>
                    {planItem.chip}
                  </View>
                  <View className="mt-4">
                    {planItem.features.map((feature, fidx) => (
                      <View
                        key={fidx}
                        className="mb-2 flex-row items-center gap-1"
                      >
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color="#13ec5b"
                          onPress={() => router.replace("/login")}
                        />
                        <Text className={planItem.textClass}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="mt-4 w-full">
                    <ButtonCustom
                      title="Elegir"
                      onPress={() => {
                        setPlan(planItem.planKey);
                        setModalVisible(false);
                      }}
                      {...planItem.buttonProps}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ModalCustom>
        <ButtonCustom title="Registrarse" onPress={handleRegister} />
      </ScrollView>
    </SafeAreaView>
  );
}
