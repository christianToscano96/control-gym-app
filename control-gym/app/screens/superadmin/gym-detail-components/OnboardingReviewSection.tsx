import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { InfoRow, SectionTitle } from "./ui";

export function OnboardingReviewSection({
  isPending,
  statusLabel,
  statusColor,
  paymentReference,
  paymentProofUploadedAt,
  paymentRejectionReason,
  paymentProofUrl,
  onApprove,
  onReject,
  loading,
  formatDate,
}: {
  isPending: boolean;
  statusLabel: string;
  statusColor: string;
  paymentReference?: string | null;
  paymentProofUploadedAt?: string | null;
  paymentRejectionReason?: string | null;
  paymentProofUrl?: string | null;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
  formatDate: (date?: string) => string;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ marginTop: 16 }}>
      <SectionTitle label="Revision de Alta (Prioridad)" />
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: isPending ? "#F59E0B50" : `${colors.error}50`,
        }}
      >
        <InfoRow
          icon="confirmation-number"
          label="ID de pago"
          value={paymentReference || "--"}
        />
        <InfoRow
          icon="schedule"
          label="Estado onboarding"
          value={statusLabel}
          valueColor={statusColor}
        />
        <InfoRow
          icon="event"
          label="Comprobante subido"
          value={formatDate(paymentProofUploadedAt || undefined)}
        />
        {paymentRejectionReason ? (
          <InfoRow
            icon="error-outline"
            label="Motivo rechazo"
            value={paymentRejectionReason}
            valueColor={colors.error}
          />
        ) : null}
        {paymentProofUrl ? (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                color: colors.textSecondary,
                marginBottom: 8,
                fontSize: 12,
              }}
            >
              Imagen de comprobante
            </Text>
            <Image
              source={{ uri: `${API_BASE_URL}${paymentProofUrl}` }}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
                backgroundColor: colors.background,
              }}
              resizeMode="cover"
            />
          </View>
        ) : (
          <Text style={{ color: "#F59E0B", marginTop: 10, fontSize: 13 }}>
            Aun no hay comprobante subido.
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <TouchableOpacity
            onPress={onApprove}
            disabled={loading}
            style={{
              flex: 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#10B98130" : "#D1FAE5",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#10B981", fontWeight: "800" }}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReject}
            disabled={loading}
            style={{
              flex: 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#DC262630" : "#FEE2E2",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#DC2626", fontWeight: "800" }}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
