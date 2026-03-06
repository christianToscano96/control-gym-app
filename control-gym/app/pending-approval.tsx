import { apiClient } from "@/api/client";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import { useMembershipStore, useUserStore } from "@/stores/store";
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

function CopyDataRow({
  label,
  value,
  onCopy,
  primaryColor,
  isDark,
  colors,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  primaryColor: string;
  isDark: boolean;
  colors: {
    text: string;
    textSecondary: string;
    border: string;
  };
}) {
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: isDark ? "#111827" : "#F8FAFC",
        padding: 12,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <View
        style={{
          marginTop: 4,
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
            fontSize: 16,
            fontWeight: "800",
            flex: 1,
          }}
        >
          {value || "--"}
        </Text>
        <TouchableOpacity
          onPress={onCopy}
          style={{
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 7,
            backgroundColor: isDark ? `${primaryColor}25` : "#E7FBEF",
            borderWidth: 1,
            borderColor: primaryColor,
          }}
        >
          <Text style={{ color: primaryColor, fontSize: 12, fontWeight: "700" }}>
            Copiar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PendingApprovalScreen() {
  const { colors, primaryColor, isDark } = useTheme();
  const router = useRouter();
  const CBU_FICTICIO = "0000003100000001234567";
  const params = useLocalSearchParams<{
    gymId?: string;
    paymentReference?: string;
    adminEmail?: string;
    adminPassword?: string;
  }>();
  const setUser = useUserStore((s) => s.setUser);
  const setHasActiveMembership = useMembershipStore((s) => s.setHasActiveMembership);

  const gymId = params.gymId || "";
  const initialPaymentReference = params.paymentReference || "";
  const adminEmail = (params.adminEmail || "").trim().toLowerCase();
  const adminPassword = params.adminPassword || "";

  const [statusData, setStatusData] = useState<RegistrationStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const [autoLoginTried, setAutoLoginTried] = useState(false);
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

  const signInAndRedirect = useCallback(async () => {
    if (!adminEmail || !adminPassword) return false;

    setAutoLoggingIn(true);
    try {
      const data = await apiClient("/api/auth/login", {
        method: "POST",
        body: { email: adminEmail, password: adminPassword },
        skipAuth: true,
      });
      setUser(data.user, data.token);

      if (data.user.role === "empleado" || data.user.role === "superadmin") {
        setHasActiveMembership(true);
        router.replace("/(tabs)");
        return true;
      }

      if (data.user.gymActive === false) {
        router.replace("/gym-suspended");
        return true;
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
      return true;
    } catch {
      return false;
    } finally {
      setAutoLoggingIn(false);
    }
  }, [adminEmail, adminPassword, router, setHasActiveMembership, setUser]);

  useEffect(() => {
    if (statusData?.onboardingStatus !== "approved" || autoLoginTried) return;
    setAutoLoginTried(true);
    signInAndRedirect();
  }, [autoLoginTried, signInAndRedirect, statusData?.onboardingStatus]);

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
      Alert.alert("Comprobante requerido", "Seleccioná un comprobante antes de continuar.");
      return;
    }

    setUploading(true);
    try {
      const filename = proofUri.split("/").pop() || "proof.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const formData = new FormData();
      formData.append("paymentReference", paymentReference);
      formData.append(
        "proof",
        {
          uri: proofUri,
          name: filename,
          type,
        } as any,
      );

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

      if (
        !copied &&
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
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
              gap: 8,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: "800",
                flex: 1,
              }}
            >
              {statusData?.gymName || "Tu gimnasio"}
            </Text>
            <View
              style={{
                backgroundColor: isDark ? `${statusColor}30` : `${statusColor}20`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: statusColor, fontWeight: "700", fontSize: 12 }}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
            {showUploadFlow
              ? "Para activar tu cuenta, transferí y subí el comprobante."
              : showPendingOnly
                ? "Tu comprobante ya fue enviado. Estamos revisándolo."
                : "Tu cuenta fue aprobada. Te estamos ingresando al dashboard."}
          </Text>

          <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                backgroundColor: isDark ? "#111827" : "#F8FAFC",
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Plan</Text>
              <Text style={{ color: colors.text, fontWeight: "800", fontSize: 14 }}>
                {(statusData?.plan || "--").toUpperCase()}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                backgroundColor: isDark ? "#111827" : "#F8FAFC",
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Monto</Text>
              <Text style={{ color: colors.text, fontWeight: "800", fontSize: 14 }}>
                ${Number(statusData?.transferAmount || 0).toLocaleString("es-AR")}
              </Text>
            </View>
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
            <Text style={{ color: colors.error, fontSize: 13, fontWeight: "700" }}>
              Motivo de rechazo
            </Text>
            <Text style={{ color: colors.error, fontSize: 13 }}>
              {statusData.paymentRejectionReason}
            </Text>
          </View>
        ) : null}

        {showUploadFlow && (
          <>
            <View style={{ marginTop: 14, gap: 8 }}>
              <CopyDataRow
                label="ID de pago (concepto)"
                value={paymentReference || "--"}
                onCopy={() => copyValue(paymentReference || "", "ID de pago")}
                primaryColor={primaryColor}
                isDark={isDark}
                colors={colors}
              />
              <CopyDataRow
                label="CBU para transferir"
                value={CBU_FICTICIO}
                onCopy={() => copyValue(CBU_FICTICIO, "CBU")}
                primaryColor={primaryColor}
                isDark={isDark}
                colors={colors}
              />
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
                Subir comprobante
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                Seleccioná una imagen clara para acelerar la aprobación.
              </Text>

              <View style={{ marginTop: 12, gap: 10 }}>
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
                  <MaterialIcons name="upload-file" size={18} color={primaryColor} />
                  <Text style={{ color: primaryColor, fontWeight: "700" }}>
                    {proofUri ? "Cambiar comprobante" : "Seleccionar comprobante"}
                  </Text>
                </TouchableOpacity>
                <ButtonCustom
                  title={uploading ? "" : "Enviar comprobante"}
                  onPress={uploadProof}
                  disabled={uploading}
                >
                  {uploading ? <ActivityIndicator size="small" color="#0d1c3d" /> : null}
                </ButtonCustom>
              </View>
            </View>
          </>
        )}

        {!!copyFeedback && (
          <Text style={{ color: colors.success, fontSize: 12, marginTop: 6 }}>
            {copyFeedback}
          </Text>
        )}

        {statusData?.paymentProofUrl ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
              Último comprobante enviado
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
              Subido: {" "}
              {statusData.paymentProofUploadedAt
                ? new Date(statusData.paymentProofUploadedAt).toLocaleString("es-AR")
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
          {isApproved ? (
            autoLoggingIn ? (
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <ActivityIndicator size="small" color={primaryColor} />
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>
                  Ingresando al dashboard...
                </Text>
              </View>
            ) : (
              <ButtonCustom
                title="Entrar al dashboard"
                onPress={async () => {
                  const logged = await signInAndRedirect();
                  if (!logged) {
                    router.replace("/login");
                  }
                }}
              />
            )
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
