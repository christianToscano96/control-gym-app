import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import {
  usePeriodPricingQuery,
  useUpdatePeriodPricing,
} from "@/hooks/queries/usePeriodPricing";
import { useToast } from "@/hooks/useToast";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PERIOD_FIELDS = [
  { key: "1 dia" as const, label: "1 Dia" },
  { key: "7 dias" as const, label: "7 Dias" },
  { key: "15 dias" as const, label: "15 Dias" },
  { key: "mensual" as const, label: "Mensual" },
];

export default function PeriodPricingScreen() {
  const { colors } = useTheme();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [prices, setPrices] = useState({
    "1 dia": "",
    "7 dias": "",
    "15 dias": "",
    mensual: "",
  });

  const { data: pricingData, isLoading } = usePeriodPricingQuery();
  const updateMutation = useUpdatePeriodPricing();

  useEffect(() => {
    if (pricingData?.periodPricing) {
      const pp = pricingData.periodPricing;
      setPrices({
        "1 dia": pp["1 dia"] ? String(pp["1 dia"]) : "",
        "7 dias": pp["7 dias"] ? String(pp["7 dias"]) : "",
        "15 dias": pp["15 dias"] ? String(pp["15 dias"]) : "",
        mensual: pp.mensual ? String(pp.mensual) : "",
      });
    }
  }, [pricingData]);

  const isConfigured = PERIOD_FIELDS.some(
    (f) => Number(prices[f.key]) > 0,
  );

  const handleSave = () => {
    const hasAtLeastOne = PERIOD_FIELDS.some(
      (f) => prices[f.key].trim() && Number(prices[f.key]) > 0,
    );

    if (!hasAtLeastOne) {
      showError("Ingresa al menos un precio");
      return;
    }

    updateMutation.mutate(
      {
        "1 dia": Number(prices["1 dia"]) || 0,
        "7 dias": Number(prices["7 dias"]) || 0,
        "15 dias": Number(prices["15 dias"]) || 0,
        mensual: Number(prices.mensual) || 0,
      },
      {
        onSuccess: () => {
          showSuccess("Precios actualizados correctamente");
          setTimeout(() => router.back(), 1500);
        },
        onError: (err: any) => {
          showError(err.message || "Error al guardar los precios");
        },
      },
    );
  };

  const updatePrice = (key: keyof typeof prices, value: string) => {
    setPrices((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1 px-5"
    >
      <View style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Precios por Periodo" isBackButton />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status indicator */}
          <View
            className="mx-4 mt-6 p-4 rounded-xl flex-row items-center gap-3"
            style={{
              backgroundColor: isConfigured ? "#f0fdf4" : "#fef2f2",
              borderWidth: 1,
              borderColor: isConfigured ? "#bbf7d0" : "#fecaca",
            }}
          >
            <MaterialIcons
              name={isConfigured ? "check-circle" : "warning"}
              size={24}
              color={isConfigured ? "#16a34a" : "#dc2626"}
            />
            <View className="flex-1">
              <Text
                className="font-semibold text-sm"
                style={{
                  color: isConfigured ? "#166534" : "#991b1b",
                }}
              >
                {isConfigured
                  ? "Precios configurados"
                  : "Precios no configurados"}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{
                  color: isConfigured ? "#15803d" : "#b91c1c",
                }}
              >
                {isConfigured
                  ? "Los precios se asignan automaticamente al crear clientes"
                  : "Configura los precios para cada periodo de membresia"}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="px-4 pt-6 pb-6">
            {PERIOD_FIELDS.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                placeholder="$0"
                value={prices[field.key]}
                onChangeText={(v) => updatePrice(field.key, v)}
                keyboardType="numeric"
                leftIcon={
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color="#9CA3AF"
                  />
                }
              />
            ))}

            {/* Help text */}
            <View
              className="p-4 rounded-xl mt-2"
              style={{ backgroundColor: colors.card }}
            >
              <Text
                className="text-xs font-bold mb-2"
                style={{ color: colors.text }}
              >
                Informacion
              </Text>
              <Text
                className="text-xs leading-5"
                style={{ color: colors.textSecondary }}
              >
                Estos precios se asignaran automaticamente cuando registres un
                nuevo cliente. El precio se puede modificar manualmente al
                momento de crear el cliente.
              </Text>
            </View>
          </View>

          {/* Save button */}
          <View className="px-4 pb-8">
            <ButtonCustom
              title={
                updateMutation.isPending
                  ? "Guardando..."
                  : "Guardar Precios"
              }
              onPress={handleSave}
              disabled={updateMutation.isPending}
            />
          </View>
        </ScrollView>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
