import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput as RNTextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../components/ui/ButtonCustom";
import TextField from "../../components/ui/TextField";
import { apiClient } from "../../api/client";
import { useMembershipStore, useUserStore } from "../../stores/store";

export const options = { headerShown: false };

export default function LoginScreen() {
  const { primaryColor, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const setUser = useUserStore((s) => s.setUser);
  const setHasActiveMembership = useMembershipStore(
    (s) => s.setHasActiveMembership,
  );

  const router = useRouter();

  const validate = () => {
    let valid = true;
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email no válido";
      valid = false;
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiClient("/api/auth/login", {
        method: "POST",
        body: { email, password },
        skipAuth: true,
      });
      setUser(data.user, data.token);
      if (data.user.role === "empleado") {
        setHasActiveMembership(true);
        router.replace("/(tabs)");
        return;
      }
      const memberships = await apiClient("/api/membership");
      const hasMembership =
        Array.isArray(memberships) && memberships.some((m: any) => m.active);
      setHasActiveMembership(hasMembership);
      if (!hasMembership) {
        router.replace("/choose-membership");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      let message = "No se pudo iniciar sesión";
      if (err instanceof Error) message = err.message;
      setErrors((prev) => ({ ...prev, password: message }));
    } finally {
      setLoading(false);
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
                        color={errors.email ? "#ef4444" : "#94a3b8"}
                      />
                    </View>
                    <TextField
                      ref={emailInputRef}
                      placeholder="admin@gym.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email)
                          setErrors((e) => ({ ...e, email: undefined }));
                      }}
                      className={`w-full rounded-2xl text-dark-blue bg-slate-50 h-14 pl-12 pr-4 text-base font-normal border-0 ${errors.email ? "border-2 border-red-500" : ""}`}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      blurOnSubmit={false}
                      error={errors.email}
                    />
                  </View>
                  {/* El mensaje de error ya lo muestra el TextField, no es necesario repetirlo aquí */}
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
                      <MaterialIcons
                        name="lock"
                        size={20}
                        color={errors.password ? "#ef4444" : "#94a3b8"}
                      />
                    </View>
                    <TextField
                      ref={passwordInputRef}
                      placeholder="••••••••"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password)
                          setErrors((e) => ({ ...e, password: undefined }));
                      }}
                      secureTextEntry={!showPassword}
                      rightIcon={
                        <MaterialIcons
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color={errors.password ? "#ef4444" : "#94a3b8"}
                        />
                      }
                      onRightIconPress={() => setShowPassword(!showPassword)}
                      className={`w-full rounded-2xl text-dark-blue bg-slate-50 h-14 pl-12 pr-12 text-base font-normal border-0 ${errors.password ? "border-2 border-red-500" : ""}`}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      error={errors.password}
                    />
                  </View>
                  {/* El mensaje de error ya lo muestra el TextField, no es necesario repetirlo aquí */}
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
                  <PrimaryButton
                    title={loading ? "Ingresando..." : "Ingresar"}
                    onPress={handleLogin}
                    disabled={loading}
                    className={loading ? "opacity-60" : ""}
                  />
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
