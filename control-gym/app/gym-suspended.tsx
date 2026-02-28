import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import { StatusBar } from "expo-status-bar";

export default function GymSuspendedScreen() {
  const { colors, isDark, primaryColor } = useTheme();
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-1 px-8 justify-center items-center">
        {/* Icon */}
        <View
          style={{ backgroundColor: isDark ? "#451a03" : "#fef3c7" }}
          className="w-28 h-28 rounded-full items-center justify-center mb-8"
        >
          <MaterialIcons
            name="warning"
            size={56}
            color="#f59e0b"
          />
        </View>

        {/* Title */}
        <Text
          style={{ color: colors.text }}
          className="text-2xl font-bold text-center mb-3"
        >
          Gimnasio Suspendido
        </Text>

        {/* Description */}
        <Text
          style={{ color: colors.textSecondary }}
          className="text-base text-center mb-8 leading-6 px-4"
        >
          Tu gimnasio ha sido deshabilitado por el administrador de la
          plataforma. Para reactivarlo, contacta al soporte o renueva tu plan.
        </Text>

        {/* Info card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="w-full rounded-2xl p-5 mb-8"
        >
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="info-outline" size={20} color="#f59e0b" />
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold ml-2"
            >
              ¿Qué significa esto?
            </Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <MaterialIcons
                name="block"
                size={16}
                color={colors.textSecondary}
                style={{ marginTop: 2 }}
              />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm ml-3 flex-1"
              >
                Tus clientes y empleados no podrán acceder al sistema
              </Text>
            </View>
            <View className="flex-row items-start mt-2">
              <MaterialIcons
                name="save"
                size={16}
                color={colors.textSecondary}
                style={{ marginTop: 2 }}
              />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm ml-3 flex-1"
              >
                Tus datos están seguros y se mantendrán guardados
              </Text>
            </View>
            <View className="flex-row items-start mt-2">
              <MaterialIcons
                name="refresh"
                size={16}
                color={colors.textSecondary}
                style={{ marginTop: 2 }}
              />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm ml-3 flex-1"
              >
                Al reactivar tu plan, todo volverá a funcionar normalmente
              </Text>
            </View>
          </View>
        </View>

        {/* Contact support button */}
        <TouchableOpacity
          style={{ backgroundColor: "#f59e0b" }}
          className="w-full h-14 rounded-2xl items-center justify-center mb-4"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="support-agent" size={22} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Contactar Soporte
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full h-14 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderColor: colors.border,
            borderWidth: 1,
          }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="logout" size={20} color={colors.textSecondary} />
            <Text
              style={{ color: colors.textSecondary }}
              className="font-semibold text-base ml-2"
            >
              Cerrar Sesión
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
