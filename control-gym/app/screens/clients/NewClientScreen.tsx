import { BadgeButton } from "@/components/ui/BadgeButton";
import ButtonCustom from "@/components/ui/ButtonCustom";
import DateSelect from "@/components/ui/DateSelect";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import PaymentMethodSelector from "@/components/ui/PaymentMethodSelector";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { useCreateClient } from "@/hooks/queries/useClients";
import { usePeriodPricingQuery } from "@/hooks/queries/usePeriodPricing";
import { useToast } from "@/hooks/useToast";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PERIOD_OPTIONS = [
  { key: "1 dia", label: "1 Dia" },
  { key: "7 dias", label: "7 Dias" },
  { key: "15 dias", label: "15 Dias" },
  { key: "mensual", label: "Mensual" },
] as const;

export default function NewClientScreen() {
  const { colors, primaryColor } = useTheme();
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
  const [price, setPrice] = useState<string>("");
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const createClientMutation = useCreateClient();
  const loading = createClientMutation.isPending;

  const { data: pricingData } = usePeriodPricingQuery();
  const periodPricing = pricingData?.periodPricing;

  useEffect(() => {
    if (periodPricing && period) {
      const periodKey = period.toLowerCase() as keyof typeof periodPricing;
      const autoPrice = periodPricing[periodKey];
      if (autoPrice !== undefined && autoPrice > 0) {
        setPrice(String(autoPrice));
      } else {
        setPrice("");
      }
    }
  }, [period, periodPricing]);

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const getBadgeLabel = (option: (typeof PERIOD_OPTIONS)[number]) => {
    if (!periodPricing) return option.label;
    const periodKey = option.key as keyof typeof periodPricing;
    const p = periodPricing[periodKey];
    if (p && p > 0) return `${option.label} - ${formatPrice(p)}`;
    return option.label;
  };

  const handleAddClient = () => {
    if (!firstName.trim()) {
      showWarning("El nombre es obligatorio");
      return;
    }
    if (!lastName.trim()) {
      showWarning("El apellido es obligatorio");
      return;
    }
    if (!email.trim()) {
      showWarning("El email es obligatorio");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showWarning("Ingresa un email valido");
      return;
    }
    if (!period) {
      showWarning("Selecciona un periodo");
      return;
    }

    createClientMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: cell.trim(),
        instagramLink: instagram.trim(),
        paymentMethod,
        membershipType: "basico",
        isActive: true,
        startDate: startDate,
        selected_period: period,
        dni: dni.trim(),
        paymentAmount: price ? Number(price) : undefined,
      },
      {
        onSuccess: () => {
          showSuccess("Cliente agregado correctamente");
          setFirstName("");
          setLastName("");
          setDni("");
          setEmail("");
          setCell("");
          setInstagram("");
          setPaymentMethod("efectivo");
          setPeriod("mensual");
          setPrice("");
          setTimeout(() => router.back(), 1000);
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : "No se pudo agregar";
          showError(message);
        },
      },
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}
    >
      <HeaderTopScrenn isBackButton title="Agregar Cliente" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-xl self-center flex-1">
          {/* Nombre + Apellido */}
          <View className="flex flex-row gap-2">
            <TextField
              label="Nombre"
              placeholder="Nombre"
              value={firstName}
              onChangeText={setFirstName}
              width="md"
              leftIcon={
                <MaterialIcons name="person" size={20} color="#9CA3AF" />
              }
            />
            <TextField
              label="Apellido"
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
              width="flex-1"
              leftIcon={
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color="#9CA3AF"
                />
              }
            />
          </View>

          {/* DNI + Celular en una fila */}
          <View className="flex flex-row gap-2">
            <TextField
              label="DNI"
              placeholder="DNI"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
              width="md"
              leftIcon={
                <MaterialIcons name="badge" size={20} color="#9CA3AF" />
              }
            />
            <TextField
              label="Celular"
              placeholder="Celular"
              value={cell}
              onChangeText={setCell}
              keyboardType="phone-pad"
              width="flex-1"
              leftIcon={
                <MaterialIcons name="phone" size={20} color="#9CA3AF" />
              }
            />
          </View>

          <TextField
            label="Correo electronico"
            placeholder="email@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <MaterialIcons name="email" size={20} color="#9CA3AF" />
            }
          />

          {/* Fecha + Periodo */}
          <DateSelect
            label="Fecha de inicio"
            value={startDate}
            onChange={setStartDate}
            placeholder="Selecciona la fecha de inicio"
            width="full"
          />

          <Text
            style={{ color: colors.text }}
            className="mb-2 font-bold text-sm"
          >
            Periodo
          </Text>
          <View className="flex flex-row gap-2 flex-wrap mb-4">
            {PERIOD_OPTIONS.map((option) => (
              <BadgeButton
                key={option.key}
                label={getBadgeLabel(option)}
                onPress={() => setPeriod(option.key)}
                isSelected={period === option.key}
              />
            ))}
          </View>

          <TextField
            label="Precio"
            placeholder="$0"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            leftIcon={
              <MaterialIcons name="attach-money" size={20} color="#9CA3AF" />
            }
          />

          {/* Metodo de Pago */}
          <Text
            style={{ color: colors.text }}
            className="mb-2 font-bold text-sm"
          >
            Metodo de Pago
          </Text>
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          {/* Resumen */}
          {price && Number(price) > 0 && (
            <View
              className="rounded-xl p-3 mt-2 mb-2 flex-row items-center justify-between"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderWidth: 1,
                borderColor: `${primaryColor}40`,
              }}
            >
              <View>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs uppercase"
                >
                  Total a cobrar
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-bold"
                >
                  {formatPrice(Number(price))}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs"
                >
                  {PERIOD_OPTIONS.find((o) => o.key === period)?.label ||
                    period}{" "}
                  ·{" "}
                  {paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <ButtonCustom
        title={loading ? "Guardando..." : "Agregar Cliente"}
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
