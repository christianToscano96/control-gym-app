import { BadgeButton } from "@/components/ui/BadgeButton";
import ButtonCustom from "@/components/ui/ButtonCustom";
import DateSelect from "@/components/ui/DateSelect";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import PaymentMethodSelector from "@/components/ui/PaymentMethodSelector";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../../constants/api";
import { useUserStore } from "../../../stores/store";

export default function NewClientScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [cell, setCell] = useState("");
  const [instagram, setInstagram] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "efectivo" | "transferencia"
  >("efectivo");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [period, setPeriod] = useState<string>("mensual");
  const [loading, setLoading] = useState(false);
  const user = useUserStore((s) => s.user);
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();

  const handleAddClient = async () => {
    if (!firstName || !lastName || !email || !paymentMethod) {
      showWarning("Completa todos los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.token ? `Bearer ${user.token}` : "",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: cell,
          instagramLink: instagram,
          paymentMethod,
          membershipType: "basico", // O puedes permitir elegirlo
          active: true,
          startDate: startDate,
          selected_period: period,
          dni,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo agregar");
      showSuccess("Cliente agregado correctamente");
      setFirstName("");
      setLastName("");
      setDni("");
      setEmail("");
      setCell("");
      setInstagram("");
      setPaymentMethod("efectivo");
      setPeriod("mensual");
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err) {
      let message = "No se pudo agregar";
      if (err instanceof Error) message = err.message;
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", padding: 16 }}>
      <HeaderTopScrenn isBackButton title="Agregar Cliente" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-xl self-center flex-1">
          <View className="space-y-4 mb-6">
            <View className="flex flex-row space-x-4 gap-2">
              <TextField
                label="First Name"
                placeholder="Enter first name"
                value={firstName}
                onChangeText={setFirstName}
                width="md"
              />
              <TextField
                label="Last Name"
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
                width="flex-1"
              />
            </View>
            <TextField
              label="DNI"
              placeholder="Enter DNI"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
            />
            <TextField
              label="Email"
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label="Cell"
              placeholder="Enter cell number"
              value={cell}
              onChangeText={setCell}
              keyboardType="phone-pad"
            />

            <DateSelect
              label="Fecha de inicio"
              value={startDate}
              onChange={setStartDate}
              placeholder="Selecciona la fecha de inicio"
              width="full"
            />
            <Text className="mb-2 font-bold">Seleccionar Periodo</Text>
            <View className="flex flex-row gap-2">
              <BadgeButton
                label="1 dia"
                onPress={() => setPeriod("1 dia")}
                isSelected={period === "1 dia"}
              />
              <BadgeButton
                label="15 dias"
                onPress={() => setPeriod("15 dias")}
                isSelected={period === "15 dias"}
              />
              <BadgeButton
                label="Mensual"
                onPress={() => setPeriod("mensual")}
                isSelected={period === "mensual"}
              />
            </View>
            <Text className="mt-4 font-bold">Seleccionar Método de Pago</Text>

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </View>

          {/*
               // Para permitir elegir el tipo de membresía, descomenta y usa este estado y el selector:
            // const [membershipType, setMembershipType] = useState<"basico" | "pro" | "proplus">("basico");

            <View className="mb-4">
              <Text className="mb-1 font-semibold text-dark-blue/70 text-sm px-1">Tipo de membresía</Text>
              <View className="flex-row gap-2">
                {[
                  { key: "basico", label: "Básico" },
                  { key: "pro", label: "Pro" },
                  { key: "proplus", label: "Pro+" },
                ].map((plan) => (
                  <ButtonCustom
                    key={plan.key}
                    title={plan.label}
                    onPress={() => setMembershipType(plan.key as any)}
                    secondary={membershipType !== plan.key}
                    md
                  />
                ))}
              </View>
            </View>
            */}
        </View>
      </ScrollView>
      <ButtonCustom
        title={loading ? "Guardando..." : "Agregar"}
        onPress={handleAddClient}
        disabled={loading}
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={3000}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
