import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress?: () => void;
  rightText?: string;
  showChevron?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  onPress,
  rightText,
  showChevron = true,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}) => {
  const { primaryColor, colors } = useTheme();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      onPress={onPress}
      disabled={showToggle}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-4 flex-1">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <MaterialIcons name={icon} size={22} color={primaryColor} />
        </View>
        <Text
          style={{ color: colors.text }}
          className="text-base font-normal flex-1"
        >
          {title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {rightText && (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {rightText}
          </Text>
        )}
        {showToggle && onToggleChange && (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: "#E5E7EB", true: primaryColor }}
            thumbColor="#FFFFFF"
          />
        )}
        {showChevron && !showToggle && (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ConfigScreen() {
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primaryColor, colors, isDark, toggleTheme } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <View style={{ backgroundColor: colors.background }} className="px-6">
        <HeaderTopScrenn title="Configuración" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-4">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold px-6 pb-2 uppercase tracking-wider"
          >
            General
          </Text>
          <View
            style={{ backgroundColor: colors.card }}
            className="mx-4 rounded-xl overflow-hidden shadow-sm shadow-black/5"
          >
            <SettingItem
              icon="palette"
              title="Tema de la App"
              rightText="Por Defecto"
              onPress={() => console.log("Theme")}
            />
            <SettingItem
              icon="dark-mode"
              title="Modo Oscuro"
              showToggle
              toggleValue={isDark}
              onToggleChange={toggleTheme}
              showChevron={false}
            />
            <SettingItem
              icon="language"
              title="Idioma"
              rightText="Español"
              onPress={() => console.log("Language")}
            />
          </View>
        </View>

        {/* SECTION: ACCOUNT */}
        <View className="mt-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold px-6 pb-2 uppercase tracking-wider"
          >
            Cuenta
          </Text>
          <View
            style={{ backgroundColor: colors.card }}
            className="mx-4 rounded-xl overflow-hidden shadow-sm shadow-black/5"
          >
            <SettingItem
              icon="person"
              title="Editar Perfil"
              onPress={() => router.push("/screens/profile-screen")}
            />
            <SettingItem
              icon="lock"
              title="Cambiar Contraseña"
              onPress={() => console.log("Change password")}
            />
            <SettingItem
              icon="notifications"
              title="Notificaciones Push"
              showToggle
              toggleValue={pushNotifications}
              onToggleChange={setPushNotifications}
              showChevron={false}
            />
          </View>
        </View>

        {/* SECTION: GYM RULES */}
        <View className="mt-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold px-6 pb-2 uppercase tracking-wider"
          >
            Reglas del Gimnasio
          </Text>
          <View
            style={{ backgroundColor: colors.card }}
            className="mx-4 rounded-xl overflow-hidden shadow-sm shadow-black/5"
          >
            <SettingItem
              icon="schedule"
              title="Horarios de Acceso"
              onPress={() => console.log("Access schedules")}
            />
            <SettingItem
              icon="qr-code"
              title="Validez del QR"
              rightText="30s"
              onPress={() => console.log("QR validity")}
            />
          </View>
        </View>

        {/* SECTION: MEMBERSHIP 
        <View className="mt-6">
          <Text className="text-xs font-bold text-gray-500 px-6 pb-2 uppercase tracking-wider">
            Membresía
          </Text>
          <View className="mx-4 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/5">
            <SettingItem
              icon="card-membership"
              title="Mi Membresía"
              onPress={() => router.push("/choose-membership")}
            />
          </View>
        </View>
        */}
        {/* LOGOUT BUTTON */}
        <View className="px-4 pt-2 pb-2">
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-4 rounded-xl bg-red-50"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={22} color="#DC2626" />
            <Text className="text-red-600 font-bold text-base">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>

          <Text
            style={{ color: colors.textSecondary }}
            className="text-center text-xs mt-6 font-medium"
          >
            App Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
