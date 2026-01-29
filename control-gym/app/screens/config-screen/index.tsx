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
  const { primaryColor } = useTheme();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
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
        <Text className="text-base font-normal text-gray-900 flex-1">
          {title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {rightText && (
          <Text className="text-sm text-gray-500">{rightText}</Text>
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
          <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ConfigScreen() {
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);
  const { primaryColor } = useTheme();
  const [darkMode, setDarkMode] = useState(false);
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 bg-white">
        <HeaderTopScrenn title="Configuración" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-4">
          <Text className="text-xs font-bold text-gray-500 px-6 pb-2 uppercase tracking-wider">
            General
          </Text>
          <View className="mx-4 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/5">
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
              toggleValue={darkMode}
              onToggleChange={setDarkMode}
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
          <Text className="text-xs font-bold text-gray-500 px-6 pb-2 uppercase tracking-wider">
            Cuenta
          </Text>
          <View className="mx-4 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/5">
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
          <Text className="text-xs font-bold text-gray-500 px-6 pb-2 uppercase tracking-wider">
            Reglas del Gimnasio
          </Text>
          <View className="mx-4 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/5">
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

          <Text className="text-center text-gray-400 text-xs mt-6 font-medium">
            App Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
