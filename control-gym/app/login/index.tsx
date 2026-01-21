import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useUserStore, useMembershipStore } from "@/store";
export const options = { headerShown: false };

export default function LoginScreen() {
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
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Credenciales incorrectas");
      const data = await res.json();
      setUser(data.user);
      // Consultar membresía activa
      const membershipsRes = await fetch(
        "http://localhost:4000/api/membership",
        {
          headers: { Authorization: `Bearer ${data.token}` },
        },
      );
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
    <>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 max-w-[430px] w-full mx-auto bg-white">
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

                  <Text className="text-dark-blue/50 text-xs font-bold tracking-widest uppercase mb-2">
                    CONTROL GYM
                  </Text>
                  <Text className="text-dark-blue text-3xl font-bold">
                    Bienvenido
                  </Text>
                </View>

                {/* Formulario */}
                <View className="space-y-5 flex-1">
                  {/* Email Input */}
                  <View>
                    <Text className="text-dark-blue/70 text-sm font-semibold pb-2 px-1">
                      Email
                    </Text>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <MaterialIcons
                          name="alternate-email"
                          size={20}
                          color="#94a3b8"
                        />
                      </View>
                      <TextInput
                        className="w-full rounded-2xl text-dark-blue bg-slate-50 h-14 pl-12 pr-4 text-base font-normal border-0"
                        placeholder="admin@gym.com"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.02,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View className="pt-4 mt-4">
                    <Text className="text-dark-blue/70 text-sm font-semibold pb-2 px-1">
                      Password
                    </Text>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <MaterialIcons name="lock" size={20} color="#94a3b8" />
                      </View>
                      <TextInput
                        className="w-full rounded-2xl text-dark-blue bg-slate-50 h-14 pl-12 pr-12 text-base font-normal border-0"
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.02,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      />
                      <TouchableOpacity
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <MaterialIcons
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password */}
                  <View className="items-end">
                    <TouchableOpacity>
                      <Text className="text-dark-blue/60 hover:text-dark-blue text-sm font-medium">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <View className="pt-4 mt-4">
                    <TouchableOpacity
                      className="w-full bg-[#13ec5b] py-4 rounded-2xl items-center justify-center"
                      onPress={handleLogin}
                      activeOpacity={0.9}
                      style={{
                        shadowColor: "#13ec5b",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                    >
                      <Text className="text-dark-blue font-bold text-base uppercase tracking-wider">
                        Ingresar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Sign Up Link */}
                  <View className="pt-2 mt-4">
                    <Text className="text-dark-blue/40 text-sm text-center">
                      Nuevo Administrador?{" "}
                      <Text
                        className="text-[#13ec5b] font-bold"
                        onPress={() => router.push("/login/register")}
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
    </>
  );
}
