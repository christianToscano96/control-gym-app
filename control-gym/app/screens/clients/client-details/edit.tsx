import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useLocalSearchParams, router } from "expo-router";
import {
  useClientDetailQuery,
  useUpdateClient,
} from "@/hooks/queries/useClients";
import Toast from "@/components/ui/Toast";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";

const EditClientScreen = () => {
  const { clientId } = useLocalSearchParams();
  const { colors, primaryColor } = useTheme();
  const { data: clientData, isLoading } = useClientDetailQuery(
    clientId as string,
  );
  const updateClientMutation = useUpdateClient();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dni: "",
  });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  React.useEffect(() => {
    if (clientData) {
      setForm({
        firstName: clientData.firstName || "",
        lastName: clientData.lastName || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        dni: clientData.dni || "",
      });
    }
  }, [clientData]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    updateClientMutation.mutate(
      { clientId: String(clientId), ...form },
      {
        onSuccess: () => {
          setToast({
            visible: true,
            message: "Cliente actualizado",
            type: "success",
          });
          setTimeout(() => {
            setToast({ visible: false, message: "", type: "success" });
            router.back();
          }, 1200);
        },
        onError: (err) => {
          setToast({
            visible: true,
            message: err.message || "Error al actualizar",
            type: "error",
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={primaryColor} />
          <Text
            style={{ marginTop: 16, color: colors.textSecondary, fontSize: 14 }}
          >
            Cargando datos del cliente...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Editar Cliente" isBackButton />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={{ gap: 16 }}>
          <View>
            <Text
              style={{
                marginBottom: 6,
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Nombre
            </Text>
            <TextInput
              value={form.firstName}
              onChangeText={(v) => handleChange("firstName", v)}
              placeholder="Nombre"
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                color: colors.text,
              }}
            />
          </View>
          <View>
            <Text
              style={{
                marginBottom: 6,
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Apellido
            </Text>
            <TextInput
              value={form.lastName}
              onChangeText={(v) => handleChange("lastName", v)}
              placeholder="Apellido"
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                color: colors.text,
              }}
            />
          </View>
          <View>
            <Text
              style={{
                marginBottom: 6,
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Email
            </Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              placeholder="Email"
              keyboardType="email-address"
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                color: colors.text,
              }}
            />
          </View>
          <View>
            <Text
              style={{
                marginBottom: 6,
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Teléfono
            </Text>
            <TextInput
              value={form.phone}
              onChangeText={(v) => handleChange("phone", v)}
              placeholder="Teléfono"
              keyboardType="phone-pad"
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                color: colors.text,
              }}
            />
          </View>
          <View>
            <Text
              style={{
                marginBottom: 6,
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              DNI
            </Text>
            <TextInput
              value={form.dni}
              onChangeText={(v) => handleChange("dni", v)}
              placeholder="DNI"
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                color: colors.text,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={updateClientMutation.isPending}
            style={{
              backgroundColor: primaryColor,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              opacity: updateClientMutation.isPending ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              {updateClientMutation.isPending
                ? "Guardando..."
                : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type as import("@/components/ui/Toast").ToastType}
        duration={3000}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
};

export default EditClientScreen;
