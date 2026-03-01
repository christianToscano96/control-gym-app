import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import { StatusBar } from "expo-status-bar";

export default function GymSuspendedScreen() {
  const { colors, isDark } = useTheme();
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
          style={{ backgroundColor: isDark ? "#2d1a1a" : "#fee2e2" }}
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
        >
          <MaterialIcons name="lock-outline" size={48} color="#ef4444" />
        </View>

        {/* Title */}
        <Text
          style={{ color: colors.text }}
          className="text-2xl font-bold text-center mb-2"
        >
          Cuenta Suspendida
        </Text>

        {/* Description */}
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm text-center mb-10 leading-5"
        >
          Tu gimnasio fue deshabilitado. Contacta soporte para reactivarlo.
        </Text>

        {/* Waiting indicator */}
        <View className="flex-row items-center mb-10">
          <ActivityIndicator size="small" color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs ml-2"
          >
            Se reactivará automáticamente cuando el admin lo habilite
          </Text>
        </View>

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
            <MaterialIcons
              name="logout"
              size={20}
              color={colors.textSecondary}
            />
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
