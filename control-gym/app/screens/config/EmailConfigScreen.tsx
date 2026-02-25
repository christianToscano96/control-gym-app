import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import {
  useEmailConfigQuery,
  useUpdateEmailConfig,
} from "@/hooks/queries/useEmailConfig";
import { useToast } from "@/hooks/useToast";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmailConfigScreen() {
  const { primaryColor, colors } = useTheme();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");

  const { data: emailConfig, isLoading } = useEmailConfigQuery();
  const updateMutation = useUpdateEmailConfig();

  useEffect(() => {
    if (emailConfig) {
      setGmailUser(emailConfig.gmailUser || "");
    }
  }, [emailConfig]);

  const handleSave = () => {
    if (!gmailUser.trim()) {
      showError("El email de Gmail es requerido");
      return;
    }
    if (!gmailAppPassword.trim()) {
      showError("La App Password es requerida");
      return;
    }

    updateMutation.mutate(
      { gmailUser: gmailUser.trim(), gmailAppPassword: gmailAppPassword.trim() },
      {
        onSuccess: () => {
          showSuccess("Configuración de email guardada");
          setGmailAppPassword("");
          setTimeout(() => router.back(), 1500);
        },
        onError: (err: any) => {
          showError(err.message || "Error al guardar la configuración");
        },
      },
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1 px-5"
    >
      <View style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Configuración de Email" isBackButton />
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
              backgroundColor: emailConfig?.isConfigured
                ? "#f0fdf4"
                : "#fef2f2",
              borderWidth: 1,
              borderColor: emailConfig?.isConfigured ? "#bbf7d0" : "#fecaca",
            }}
          >
            <MaterialIcons
              name={emailConfig?.isConfigured ? "check-circle" : "warning"}
              size={24}
              color={emailConfig?.isConfigured ? "#16a34a" : "#dc2626"}
            />
            <View className="flex-1">
              <Text
                className="font-semibold text-sm"
                style={{
                  color: emailConfig?.isConfigured ? "#166534" : "#991b1b",
                }}
              >
                {emailConfig?.isConfigured
                  ? "Email configurado"
                  : "Email no configurado"}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{
                  color: emailConfig?.isConfigured ? "#15803d" : "#b91c1c",
                }}
              >
                {emailConfig?.isConfigured
                  ? "Los emails de bienvenida se enviarán automáticamente"
                  : "Configurá tu Gmail para enviar emails a tus clientes"}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="px-4 pt-6 pb-6">
            <TextField
              label="Email de Gmail"
              placeholder="tu-email@gmail.com"
              value={gmailUser}
              onChangeText={setGmailUser}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <MaterialIcons name="email" size={20} color="#9CA3AF" />
              }
            />

            <TextField
              label="App Password"
              placeholder={
                emailConfig?.isConfigured
                  ? "Ingresá nueva password para actualizar"
                  : "xxxx xxxx xxxx xxxx"
              }
              value={gmailAppPassword}
              onChangeText={setGmailAppPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIcon={
                <MaterialIcons name="lock" size={20} color="#9CA3AF" />
              }
            />

            {/* Help text */}
            <View
              className="p-4 rounded-xl mt-2"
              style={{ backgroundColor: colors.card }}
            >
              <Text
                className="text-xs font-bold mb-2"
                style={{ color: colors.text }}
              >
                ¿Cómo obtener la App Password?
              </Text>
              <Text
                className="text-xs leading-5"
                style={{ color: colors.textSecondary }}
              >
                1. Activá la verificación en 2 pasos en tu cuenta de Google
                {"\n"}2. Andá a myaccount.google.com → Seguridad{"\n"}3. Buscá
                "Contraseñas de aplicaciones"{"\n"}4. Creá una nueva con nombre
                "Gym App"{"\n"}5. Copiá la contraseña de 16 caracteres
              </Text>
            </View>
          </View>

          {/* Save button */}
          <View className="px-4 pb-8">
            <ButtonCustom
              title={
                updateMutation.isPending ? "Guardando..." : "Guardar Configuración"
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
