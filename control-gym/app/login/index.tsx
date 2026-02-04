import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../components/ui/ButtonCustom";
import TextField from "../../components/ui/TextField";
import { API_BASE_URL } from "../../constants/api";
import { useMembershipStore, useUserStore } from "../../stores/store";

export const options = { headerShown: false };

export default function LoginScreen() {
  const { primaryColor, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const setHasActiveMembership = useMembershipStore(
    (s) => s.setHasActiveMembership,
  );

  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Llamada real a la API de login
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Credenciales incorrectas");
      const data = await res.json();
      setUser(data.user, data.token);

      // Si es staff (empleado), ir directo al dashboard
      if (data.user.role === "empleado") {
        setHasActiveMembership(true); // Staff siempre tiene acceso
        router.replace("/(tabs)");
        return;
      }

      // Para admin/superadmin, consultar membresía activa
      const membershipsRes = await fetch(`${API_BASE_URL}/api/membership`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const memberships = await membershipsRes.json();
      const hasMembership =
        Array.isArray(memberships) && memberships.some((m) => m.active);
      setHasActiveMembership(hasMembership);
      if (!hasMembership) {
        router.replace("/choose-membership");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      let message = "No se pudo iniciar sesión";
      if (err instanceof Error) message = err.message;
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{ backgroundColor: colors.background }}
            className="flex-1 max-w-[430px] w-full mx-auto"
          >
            {/* Contenido Principal */}
            <View className="flex-1 px-8 pt-20 pb-10">
              {/* Logo y Título */}
              <View className="items-center mb-12">
                <View className="w-100 h-240 rounded-3xl items-center justify-center mb-6  rotate-3">
                  <Image
                    source={require("../../assets/images/gymm-logo.png")}
                    style={{
                      width: 400,
                      height: 120,
                      resizeMode: "contain",
                      transform: [{ rotate: "-3deg" }],
                    }}
                  />
                </View>

                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                >
                  CONTROL GYM
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="text-3xl font-bold"
                >
                  Bienvenido
                </Text>
              </View>

              {/* Formulario */}
              <View className="space-y-5 flex-1">
                {/* Email Input */}
                <View>
                  <Text
                    style={{ color: colors.text }}
                    className="text-sm font-semibold pb-2 px-1"
                  >
                    Email
                  </Text>
                  <View className="relative">
                    <View className="absolute left-4 top-8 -translate-y-1/2 z-10">
                      <MaterialIcons
                        name="alternate-email"
                        size={20}
                        color="#94a3b8"
                      />
                    </View>
                    <TextField
                      placeholder="admin@gym.com"
                      value={email}
                      onChangeText={setEmail}
                      className="w-full rounded-2xl text-dark-blue bg-slate-50 h-14 pl-12 pr-4 text-base font-normal border-0"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="pt-4 mt-4">
                  <Text
                    style={{ color: colors.text }}
                    className="text-sm font-semibold pb-2 px-1"
                  >
                    Password
                  </Text>
                  <View className="relative">
                    <View className="absolute left-4 top-8 -translate-y-1/2 z-10 ">
                      <MaterialIcons name="lock" size={20} color="#94a3b8" />
                    </View>
                    <TextField
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      rightIcon={
                        <MaterialIcons
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#94a3b8"
                        />
                      }
                      onRightIconPress={() => setShowPassword(!showPassword)}
                      className="w-full rounded-2xl text-dark-blue bg-slate-50 h-14 pl-12 pr-12 text-base font-normal border-0"
                    />
                  </View>
                </View>

                {/* Forgot Password */}
                <View className="items-end">
                  <TouchableOpacity>
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="text-sm font-medium"
                    >
                      Olvidó su contraseña?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <View className="pt-4 mt-4">
                  <PrimaryButton title="Ingresar" onPress={handleLogin} />
                </View>

                {/* Sign Up Link */}
                <View className="pt-2 mt-4">
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-lg text-center"
                  >
                    Nuevo Administrador?{" "}
                    <Text
                      style={{ color: primaryColor }}
                      className="font-bold"
                      onPress={() => router.push("./login/register")}
                    >
                      Crear cuenta
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
