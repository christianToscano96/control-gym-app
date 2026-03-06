import ButtonCustom from "@/components/ui/ButtonCustom";
import Chip from "@/components/ui/Chip";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ModalCustom from "../../components/ui/ModalCustom";
import TextField from "../../components/ui/TextField";
import { apiClient } from "../../api/client";
import { useTheme } from "@/context/ThemeContext";
import { fetchPublicPlanPrices } from "@/api/register";

export default function RegisterScreen() {
  const { colors, primaryColor, isDark } = useTheme();
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [plan, setPlan] = useState("proplus");
  const [submitting, setSubmitting] = useState(false);
  const [planPrices, setPlanPrices] = useState({
    basico: 15000,
    pro: 25000,
    proplus: 40000,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    fetchPublicPlanPrices()
      .then((data) => setPlanPrices(data))
      .catch(() => {});
  }, []);

  const selectedPlanTitle =
    {
      basico: "Plan Básico",
      pro: "Plan Pro",
      proplus: "Plan Pro+",
    }[plan] || "Plan";

  const selectedPlanPrice =
    planPrices[plan as keyof typeof planPrices] || 0;

  const formIsValid =
    adminName.trim().length >= 3 &&
    /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(adminEmail.trim()) &&
    adminPassword.length >= 6 &&
    gymName.trim().length >= 2 &&
    gymAddress.trim().length >= 4;

  const handleRegister = async () => {
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim() || !gymName.trim()) {
      Alert.alert("Datos incompletos", "Completá los campos requeridos.");
      return;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(adminEmail.trim())) {
      Alert.alert("Email inválido", "Ingresá un email válido.");
      return;
    }
    if (adminPassword.length < 6) {
      Alert.alert("Contraseña inválida", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiClient<{
        gymId: string;
        paymentReference: string;
      }>("/api/register", {
        method: "POST",
        body: {
          adminName,
          adminEmail,
          adminPassword,
          gymName,
          gymAddress,
          plan,
        },
        skipAuth: true,
      });
      router.replace({
        pathname: "/pending-approval",
        params: {
          gymId: data.gymId,
          paymentReference: data.paymentReference,
          adminEmail: adminEmail.trim().toLowerCase(),
          adminPassword,
        },
      });
    } catch (err) {
      let message = "No se pudo registrar";
      if (err instanceof Error) message = err.message;
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}
      className="flex-1"
    >
      <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
        <HeaderTopScrenn title="Nueva Cuenta" isBackButton />

        <View
          className="mb-4 p-4 mt-6 rounded-2xl"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
            Datos del administrador
          </Text>
          <TextField
            placeholder="Nombre completo"
            value={adminName}
            onChangeText={setAdminName}
          />
          <TextField
            placeholder="Email"
            value={adminEmail}
            onChangeText={setAdminEmail}
          />
          <TextField
            placeholder="Contraseña"
            value={adminPassword}
            onChangeText={setAdminPassword}
            secureTextEntry
          />
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: -4, marginBottom: 10 }}>
            Mínimo 6 caracteres.
          </Text>

          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
            Datos del gimnasio
          </Text>
          <TextField
            placeholder="Nombre del gimnasio"
            value={gymName}
            onChangeText={setGymName}
          />
          <TextField
            placeholder="Dirección del gimnasio"
            value={gymAddress}
            onChangeText={setGymAddress}
          />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-full mb-2 py-3 px-4 rounded-2xl border-2 flex flex-row items-center justify-between"
            style={{ backgroundColor: colors.background, borderColor: primaryColor }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                style={{ color: plan ? colors.text : colors.textSecondary }}
                className="font-bold text-base"
              >
                {selectedPlanTitle}
              </Text>
              {plan === "proplus" ? <Chip label="PREMIUM" primary /> : null}
            </View>
            <MaterialIcons
              name="expand-more"
              size={24}
              color={plan ? primaryColor : "#94a3b8"}
            />
          </TouchableOpacity>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Precio actual: ${selectedPlanPrice.toLocaleString("es-AR")} / mes
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
            Al registrarte te llevaremos a la pantalla para subir comprobante de transferencia.
          </Text>
        </View>

        <ModalCustom
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            className="rounded-2xl p-6 w-full h-full pt-20"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex flex-row gap-2">
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={colors.textSecondary}
                onPress={() => setModalVisible(false)}
              />
              <Text
                style={{ color: colors.text, fontWeight: "bold", fontSize: 18, marginBottom: 16 }}
              >
                Selecciona un plan
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {[
                {
                  nivel: "NIVEL 3",
                  price: `$${planPrices.proplus.toLocaleString("es-AR")}/mes`,
                  title: "Plan Pro+",
                  planKey: "proplus",
                  features: [
                    "Capacidad Ilimitada de clientes",
                    "Multi-sede sincronizada",
                    "Control de acceso Facial y Qr",
                    "Reportes de flujo Avanzado y Multiples",
                  ],
                  style:
                    "mb-6 p-4 rounded-lg bg-[#1e293b] shadow-lg shadow-[#13ec5b] text-white",
                  chip: <Chip label="PREMIUM" primary />,
                  textClass: "text-white",
                  titleClass: "text-3xl font-bold text-white",
                  priceClass: "text-2xl font-bold text-white",
                  buttonProps: { md: true },
                },
                {
                  nivel: "NIVEL 1",
                  price: `$${planPrices.basico.toLocaleString("es-AR")}/mes`,
                  title: "Plan Básico",
                  planKey: "basico",
                  features: [
                    "Capacidad: 100 clientes",
                    "2 administradores",
                    "Control de acceso QR",
                    "Reportes de flujo basico",
                  ],
                  style:
                    "mb-6 p-4 rounded-lg drop-shadow-3xl shadow-sm",
                  chip: null,
                  textClass: "",
                  titleClass: "text-3xl font-bold",
                  priceClass: "text-2xl font-bold",
                  buttonProps: { secondary: true, md: true },
                },
                {
                  nivel: "NIVEL 2",
                  price: `$${planPrices.pro.toLocaleString("es-AR")}/mes`,
                  title: "Plan Pro",
                  planKey: "pro",
                  features: [
                    "Capacidad: 500 clientes",
                    "4 administradores",
                    "Control de acceso Facial y Qr",
                    "Reportes de flujo Avanzado",
                  ],
                  style:
                    "mb-6 p-4 rounded-lg drop-shadow-3xl shadow-sm",
                  chip: <Chip label="Recomendado" primary />,
                  textClass: "",
                  titleClass: "text-3xl font-bold",
                  priceClass: "text-2xl font-bold",
                  buttonProps: { md: true },
                },
              ].map((planItem, idx) => (
                <View
                  key={planItem.nivel}
                  className={planItem.style}
                  style={{
                    backgroundColor:
                      planItem.planKey === plan
                        ? isDark
                          ? `${primaryColor}22`
                          : "#EAFBF1"
                        : colors.card,
                    borderWidth: 1,
                    borderColor: planItem.planKey === plan ? primaryColor : colors.border,
                  }}
                >
                  <View className="mb-2 flex-row justify-between items-center">
                    <Text style={{ color: colors.textSecondary }} className={`font-semibold ${planItem.textClass}`}>
                      {planItem.nivel}
                    </Text>
                    <Text style={{ color: colors.text }} className={planItem.priceClass}>
                      {planItem.price}
                    </Text>
                  </View>
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text style={{ color: colors.text }} className={planItem.titleClass}>
                      {planItem.title}
                    </Text>
                    {planItem.chip}
                  </View>
                  <View className="mt-4">
                    {planItem.features.map((feature, fidx) => (
                      <View
                        key={fidx}
                        className="mb-2 flex-row items-center gap-1"
                      >
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color={primaryColor}
                        />
                        <Text style={{ color: colors.textSecondary }} className={planItem.textClass}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View className="mt-4 w-full">
                    <ButtonCustom
                      title={planItem.planKey === plan ? "Seleccionado" : "Elegir"}
                      onPress={() => {
                        setPlan(planItem.planKey);
                        setModalVisible(false);
                      }}
                      disabled={planItem.planKey === plan}
                      {...planItem.buttonProps}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ModalCustom>
      </ScrollView>
      <ButtonCustom
        title={submitting ? "" : "Crear cuenta"}
        onPress={handleRegister}
        disabled={!formIsValid || submitting}
      >
        {submitting ? <ActivityIndicator size="small" color="#0d1c3d" /> : null}
      </ButtonCustom>
    </SafeAreaView>
  );
}
