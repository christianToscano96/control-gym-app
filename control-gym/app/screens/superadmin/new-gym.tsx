import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useCreateGym } from "@/hooks/queries/useSuperAdmin";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Toast, { ToastType } from "@/components/ui/Toast";

const planOptions = [
  {
    key: "basico" as const,
    label: "Basico",
    price: "$15,000",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  {
    key: "pro" as const,
    label: "Pro",
    price: "$25,000",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    key: "proplus" as const,
    label: "Pro+",
    price: "$40,000",
    color: "#DB2777",
    bg: "#FDF2F8",
  },
];

export default function NewGymScreen() {
  const router = useRouter();
  const { colors, primaryColor, isDark } = useTheme();
  const createMutation = useCreateGym();

  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [plan, setPlan] = useState<"basico" | "pro" | "proplus">("basico");
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: "", type: "success" });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  const isValid =
    gymName.trim() &&
    adminName.trim() &&
    adminEmail.trim() &&
    adminPassword.length >= 6;

  const handleCreate = () => {
    if (!isValid) return;

    createMutation.mutate(
      {
        gymName: gymName.trim(),
        gymAddress: gymAddress.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
        plan,
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast("Gimnasio creado correctamente");
          setTimeout(() => router.back(), 1200);
        },
        onError: (error: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          showToast(
            error?.data?.message || "Error al crear el gimnasio",
            "error",
          );
        },
      },
    );
  };

  const inputStyle = {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 6,
    marginTop: 14,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Nuevo Gimnasio" isBackButton />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Gym Section */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialIcons name="store" size={20} color={primaryColor} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Datos del Gimnasio
              </Text>
            </View>

            <Text style={labelStyle}>Nombre *</Text>
            <TextInput
              value={gymName}
              onChangeText={setGymName}
              placeholder="Nombre del gimnasio"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
            />

            <Text style={labelStyle}>Direccion</Text>
            <TextInput
              value={gymAddress}
              onChangeText={setGymAddress}
              placeholder="Direccion del gimnasio"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
            />
          </View>

          {/* Plan Section */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialIcons
                name="card-membership"
                size={20}
                color={primaryColor}
              />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Plan
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              {planOptions.map((p) => {
                const selected = plan === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setPlan(p.key)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                      backgroundColor: selected
                        ? isDark
                          ? `${p.color}30`
                          : p.bg
                        : isDark
                          ? colors.background
                          : "#f8fafc",
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? p.color : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? p.color : colors.textSecondary,
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      {p.label}
                    </Text>
                    <Text
                      style={{
                        color: selected ? p.color : colors.textSecondary,
                        fontWeight: "600",
                        fontSize: 11,
                        marginTop: 2,
                        opacity: 0.8,
                      }}
                    >
                      {p.price}/mes
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Admin Section */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialIcons name="person" size={20} color={primaryColor} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Admin del Gimnasio
              </Text>
            </View>

            <Text style={labelStyle}>Nombre *</Text>
            <TextInput
              value={adminName}
              onChangeText={setAdminName}
              placeholder="Nombre del administrador"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
            />

            <Text style={labelStyle}>Email *</Text>
            <TextInput
              value={adminEmail}
              onChangeText={setAdminEmail}
              placeholder="email@ejemplo.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
            />

            <Text style={labelStyle}>Contrasena *</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder="Minimo 6 caracteres"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                }}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {adminPassword.length > 0 && adminPassword.length < 6 && (
              <Text
                style={{
                  color: colors.error,
                  fontSize: 12,
                  marginTop: 4,
                  marginLeft: 4,
                }}
              >
                Minimo 6 caracteres
              </Text>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!isValid || createMutation.isPending}
            activeOpacity={0.8}
            style={{
              backgroundColor: primaryColor,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 24,
              opacity: !isValid || createMutation.isPending ? 0.5 : 1,
            }}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MaterialIcons name="add-business" size={22} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  Crear Gimnasio
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </SafeAreaView>
  );
}
