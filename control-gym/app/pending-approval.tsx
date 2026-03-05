import { apiClient } from "@/api/client";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import { useTheme } from "@/context/ThemeContext";
import { API_BASE_URL } from "@/constants/api";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  NativeModules,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OnboardingStatus = "pending" | "approved" | "rejected";

interface RegistrationStatusResponse {
  gymId: string;
  gymName: string;
  plan: "basico" | "pro" | "proplus";
  onboardingStatus: OnboardingStatus;
  paymentReference: string;
  transferAmount?: number;
  paymentProofUrl: string | null;
  paymentProofUploadedAt: string | null;
  paymentRejectionReason: string | null;
}

export default function PendingApprovalScreen() {
  const { colors, primaryColor, isDark } = useTheme();
  const router = useRouter();
  const CBU_FICTICIO = "0000003100000001234567";
  const params = useLocalSearchParams<{
    gymId?: string;
    paymentReference?: string;
  }>();

  const gymId = params.gymId || "";
  const initialPaymentReference = params.paymentReference || "";

  const [statusData, setStatusData] =
    useState<RegistrationStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofUri, setProofUri] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const paymentReference = useMemo(
    () => statusData?.paymentReference || initialPaymentReference,
    [statusData?.paymentReference, initialPaymentReference],
  );

  const fetchStatus = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const data = await apiClient<RegistrationStatusResponse>(
        `/api/register/${gymId}/status`,
        { skipAuth: true },
      );
      setStatusData(data);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "No se pudo cargar el estado",
      );
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const pickProof = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setProofUri(result.assets[0].uri);
    }
  };

  const uploadProof = async () => {
    if (!gymId || !paymentReference) {
      Alert.alert("Error", "Faltan datos del registro.");
      return;
    }
    if (!proofUri) {
      Alert.alert(
        "Comprobante requerido",
        "Seleccioná el comprobante antes de continuar.",
      );
      return;
    }

    setUploading(true);
    try {
      const filename = proofUri.split("/").pop() || "proof.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const formData = new FormData();
      formData.append("paymentReference", paymentReference);
      formData.append("proof", {
        uri: proofUri,
        name: filename,
        type,
      } as any);

      await apiClient(`/api/register/${gymId}/proof`, {
        method: "POST",
        body: formData,
        skipAuth: true,
      });

      setProofUri("");
      Alert.alert(
        "Enviado",
        "Comprobante recibido. Tu cuenta queda pendiente hasta revisión del administrador.",
      );
      await fetchStatus();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "No se pudo subir el comprobante",
      );
    } finally {
      setUploading(false);
    }
  };

  const copyValue = async (value: string, label: string) => {
    if (!value) return;
    try {
      let copied = false;

      try {
        Clipboard.setString(value);
        const check = await Clipboard.getString();
        copied = check === value;
      } catch {}

      if (!copied) {
        const nativeClipboard =
          NativeModules?.Clipboard ||
          NativeModules?.RNCClipboard ||
          NativeModules?.NativeClipboard;
        if (nativeClipboard?.setString) {
          nativeClipboard.setString(value);
          copied = true;
        }
      }

      if (!copied && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }

      if (copied) {
        setCopyFeedback(`${label} copiado`);
        setTimeout(() => setCopyFeedback(""), 1800);
      } else {
        Alert.alert(`Copiar ${label}`, `${label}: ${value}`);
      }
    } catch {
      Alert.alert(`Copiar ${label}`, `${label}: ${value}`);
    }
  };

  const status = statusData?.onboardingStatus || "pending";
  const hasUploadedProof = Boolean(
    statusData?.paymentProofUploadedAt || statusData?.paymentProofUrl,
  );
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isApproved = status === "approved";
  const showUploadFlow = isRejected || (isPending && !hasUploadedProof);
  const showPendingOnly = isPending && hasUploadedProof;
  const statusColor =
    isApproved ? colors.success : isRejected ? colors.error : "#F59E0B";
  const statusLabel =
    isApproved ? "Aprobado" : isRejected ? "Rechazado" : "Pendiente";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Confirmacion de Cuenta" isBackButton />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 21,
                fontWeight: "800",
                flex: 1,
              }}
            >
              {statusData?.gymName || "Tu gimnasio"}
            </Text>
            <View
              style={{
                backgroundColor: isDark
                  ? `${statusColor}30`
                  : `${statusColor}20`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text
                style={{ color: statusColor, fontWeight: "700", fontSize: 12 }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Plan: {statusData?.plan || "--"}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}
          >
            Monto a transferir:{" "}
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              ${Number(statusData?.transferAmount || 0).toLocaleString("es-AR")}
            </Text>
          </Text>

          <View
            style={{
              marginTop: 12,
              borderRadius: 12,
              backgroundColor: isDark ? "#111827" : "#F8FAFC",
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              ID de pago (concepto de transferencia)
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Text
                selectable
                style={{
                  color: colors.text,
                  fontWeight: "800",
                  fontSize: 18,
                  flex: 1,
                }}
              >
                {paymentReference || "--"}
              </Text>
              <TouchableOpacity
                onPress={() => copyValue(paymentReference || "", "ID de pago")}
                disabled={!paymentReference}
                style={{
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  backgroundColor: isDark ? `${primaryColor}25` : "#E7FBEF",
                  borderWidth: 1,
                  borderColor: primaryColor,
                  opacity: paymentReference ? 1 : 0.5,
                }}
              >
                <Text
                  style={{
                    color: primaryColor,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  Copiar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {statusData?.paymentRejectionReason ? (
            <View
              style={{
                marginTop: 12,
                borderRadius: 12,
                backgroundColor: isDark ? "#7F1D1D30" : "#FEE2E2",
                padding: 10,
              }}
            >
              <Text
                style={{ color: colors.error, fontSize: 13, fontWeight: "700" }}
              >
                Motivo de rechazo
              </Text>
              <Text style={{ color: colors.error, fontSize: 13 }}>
                {statusData.paymentRejectionReason}
              </Text>
            </View>
          ) : null}
        </View>

        {showUploadFlow && (
          <>
            <View style={{ marginTop: 14, gap: 8 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
                {isRejected ? "Pasos para reenviar" : "Pasos"}
              </Text>
              {[
                "1) Hace la transferencia con ese ID en el concepto.",
                isRejected ? "2) Subí un nuevo comprobante." : "2) Subí el comprobante.",
                "3) Esperá aprobación para activar el dashboard.",
              ].map((step) => (
                <View
                  key={step}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                marginTop: 14,
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: "800" }}>
                Datos para transferir
              </Text>
              <Text
                style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
              >
                Banco Gym Demo (ficticio)
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Titular: Control Gym Demo
              </Text>
              <Text
                selectable
                style={{
                  color: colors.text,
                  fontWeight: "800",
                  fontSize: 17,
                  marginTop: 8,
                }}
              >
                CBU: {CBU_FICTICIO}
              </Text>
              <TouchableOpacity
                onPress={() => copyValue(CBU_FICTICIO, "CBU")}
                activeOpacity={0.85}
                style={{
                  marginTop: 10,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: isDark ? `${primaryColor}25` : "#E7FBEF",
                  borderWidth: 1,
                  borderColor: primaryColor,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <MaterialIcons name="content-copy" size={16} color={primaryColor} />
                <Text style={{ color: primaryColor, fontWeight: "700" }}>
                  Copiar CBU
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {!!copyFeedback && (
          <Text style={{ color: colors.success, fontSize: 12, marginTop: 6 }}>
            {copyFeedback}
          </Text>
        )}

        {showUploadFlow && statusData?.paymentProofUrl ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
              Ultimo comprobante enviado
            </Text>
            <Image
              source={{ uri: `${API_BASE_URL}${statusData.paymentProofUrl}` }}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
                backgroundColor: colors.card,
              }}
              resizeMode="cover"
            />
            <Text style={{ color: colors.success, marginTop: 6, fontSize: 12 }}>
              Subido:{" "}
              {statusData.paymentProofUploadedAt
                ? new Date(statusData.paymentProofUploadedAt).toLocaleString(
                    "es-AR",
                  )
                : "--"}
            </Text>
          </View>
        ) : null}

        {showUploadFlow && proofUri ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
              Nuevo comprobante seleccionado
            </Text>
            <Image
              source={{ uri: proofUri }}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
                backgroundColor: colors.card,
              }}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={{ marginTop: 16, gap: 10 }}>
          {showUploadFlow ? (
            <>
              <TouchableOpacity
                onPress={pickProof}
                activeOpacity={0.85}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: primaryColor,
                  backgroundColor: colors.card,
                  paddingVertical: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MaterialIcons
                  name="upload-file"
                  size={18}
                  color={primaryColor}
                />
                <Text style={{ color: primaryColor, fontWeight: "700" }}>
                  Seleccionar comprobante
                </Text>
              </TouchableOpacity>
              <ButtonCustom
                title={uploading ? "" : "Enviar comprobante"}
                onPress={uploadProof}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#0d1c3d" />
                ) : null}
              </ButtonCustom>
            </>
          ) : isApproved ? (
            <ButtonCustom
              title="Ir a iniciar sesion"
              onPress={() => router.replace("/login")}
            />
          ) : null}

          {showPendingOnly && (
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                fontSize: 13,
              }}
            >
              Comprobante enviado. Solo queda esperar la aprobación.
            </Text>
          )}

          <TouchableOpacity onPress={fetchStatus} activeOpacity={0.8}>
            <Text
              style={{
                color: primaryColor,
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              {loading ? "Actualizando estado..." : "Actualizar estado"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
