import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import {
  useSuperAdminPlanPricesQuery,
  useUpdateSuperAdminPlanPrices,
} from "@/hooks/queries/useSuperAdmin";
import { useToast } from "@/hooks/useToast";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuperAdminPlanPricingScreen() {
  const { colors } = useTheme();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [prices, setPrices] = useState({
    basico: "",
    pro: "",
    proplus: "",
  });

  const { data, isLoading } = useSuperAdminPlanPricesQuery();
  const updateMutation = useUpdateSuperAdminPlanPrices();

  useEffect(() => {
    if (data) {
      setPrices({
        basico: String(data.basico ?? 0),
        pro: String(data.pro ?? 0),
        proplus: String(data.proplus ?? 0),
      });
    }
  }, [data]);

  const handleSave = () => {
    const parsed = {
      basico: Number(prices.basico),
      pro: Number(prices.pro),
      proplus: Number(prices.proplus),
    };

    if (
      [parsed.basico, parsed.pro, parsed.proplus].some(
        (n) => Number.isNaN(n) || n < 0,
      )
    ) {
      showError("Todos los precios deben ser números válidos (>= 0)");
      return;
    }

    updateMutation.mutate(parsed, {
      onSuccess: () => {
        showSuccess("Precios de planes actualizados");
        setTimeout(() => router.back(), 1200);
      },
      onError: (err: any) => {
        showError(err.message || "No se pudo actualizar");
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20 }}>
        <HeaderTopScrenn title="Precios de Planes" isBackButton />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              marginTop: 12,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>
              Configuración de precios SaaS
            </Text>
            <Text
              style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
            >
              Estos precios se usan en registro, cards de selección y monto a
              transferir.
            </Text>
          </View>

          <View style={{ marginTop: 14 }}>
            <TextField
              label="Plan Básico"
              placeholder="0"
              keyboardType="numeric"
              value={prices.basico}
              onChangeText={(v) => setPrices((p) => ({ ...p, basico: v }))}
              leftIcon={
                <MaterialIcons name="attach-money" size={20} color="#9CA3AF" />
              }
            />
            <TextField
              label="Plan Pro"
              placeholder="0"
              keyboardType="numeric"
              value={prices.pro}
              onChangeText={(v) => setPrices((p) => ({ ...p, pro: v }))}
              leftIcon={
                <MaterialIcons name="attach-money" size={20} color="#9CA3AF" />
              }
            />
            <TextField
              label="Plan Pro+"
              placeholder="0"
              keyboardType="numeric"
              value={prices.proplus}
              onChangeText={(v) => setPrices((p) => ({ ...p, proplus: v }))}
              leftIcon={
                <MaterialIcons name="attach-money" size={20} color="#9CA3AF" />
              }
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <ButtonCustom
              title={
                updateMutation.isPending ? "Guardando..." : "Guardar precios"
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
