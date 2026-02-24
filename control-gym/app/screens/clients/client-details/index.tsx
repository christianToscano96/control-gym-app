import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { useClientDetailQuery, useDeleteClient } from "@/hooks/queries/useClients";
import { useToast } from "@/hooks/useToast";
import {
  calculateExpirationDate,
  formatDate,
  hasExpired,
  isExpiringSoon,
} from "@/utils/membershipUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClientHeader } from "./components/ClientHeader";
import { ClientInfoCard } from "./components/ClientInfoCard";
import { PaymentHistory } from "./components/PaymentHistory";
import { StatsCards } from "./components/StatsCards";

// Mock payment data - replace with actual API call when backend supports it
const MOCK_PAYMENTS = [
  {
    _id: "1",
    amount: 50,
    date: "2026-01-15",
    method: "Efectivo",
    status: "Completado",
  },
  {
    _id: "2",
    amount: 50,
    date: "2025-12-15",
    method: "Transferencia",
    status: "Completado",
  },
  {
    _id: "3",
    amount: 50,
    date: "2025-11-15",
    method: "Efectivo",
    status: "Completado",
  },
];

const UserDetailsScreen = () => {
  const { clientId } = useLocalSearchParams();
  const { primaryColor, colors } = useTheme();
  const { toast, showSuccess, showError, hideToast } = useToast();

  // ─── TanStack Query ──────────────────────────────────────────
  const {
    data: clientData,
    isLoading: loading,
    error: queryError,
  } = useClientDetailQuery(clientId as string);

  const deleteClientMutation = useDeleteClient();
  const deleting = deleteClientMutation.isPending;

  const error = queryError?.message || "";

  // Derived state
  const fullName =
    `${clientData?.firstName || ""} ${clientData?.lastName || ""}`.trim();
  const statusLabel = clientData?.active ? "Activo" : "Inactivo";

  // Membership expiration calculations
  const expirationDate = calculateExpirationDate(
    clientData?.membershipStartDate,
    clientData?.createdAt,
    clientData?.selected_period,
  );
  const expired = hasExpired(expirationDate);
  const expiringSoon = isExpiringSoon(expirationDate);
  const expirationDateText = formatDate(expirationDate);
  const expirationLabel = expired ? "Expiró" : "Válido hasta";

  const onDeleteClient = () => {
    Alert.alert(
      "Eliminar Cliente",
      `¿Estás seguro de que deseas eliminar a ${clientData?.firstName || "este cliente"}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteClientMutation.mutate(String(clientId), {
              onSuccess: () => {
                showSuccess("Cliente eliminado correctamente");
                setTimeout(() => router.back(), 1000);
              },
              onError: (err) => {
                showError(err.message || "No se pudo eliminar el cliente");
              },
            });
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4" style={{ color: colors.textSecondary }}>
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        className="flex-1 px-6"
        style={{ backgroundColor: colors.background }}
      >
        <HeaderTopScrenn title="Detalles" isBackButton />
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text
            className="mt-4 text-center text-lg"
            style={{ color: colors.error }}
          >
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!clientData) {
    return (
      <SafeAreaView
        className="flex-1 px-6"
        style={{ backgroundColor: colors.background }}
      >
        <HeaderTopScrenn title="Detalles" isBackButton />
        <View className="flex-1 justify-center items-center">
          <MaterialIcons
            name="person-off"
            size={64}
            color={colors.textSecondary}
          />
          <Text
            className="mt-4 text-center text-lg"
            style={{ color: colors.textSecondary }}
          >
            No se encontró el cliente.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="px-6" style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Detalles" isBackButton />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ClientHeader avatarUri={clientData.avatarUri} fullName={fullName} />

        <StatsCards
          primaryColor={primaryColor}
          attendanceCount={clientData.attendanceCount || 0}
          expirationDateText={expirationDateText}
          expirationLabel={expirationLabel}
          hasExpired={expired}
          isExpiringSoon={expiringSoon}
          statusLabel={statusLabel}
          isActive={clientData.active}
        />

        <ClientInfoCard
          email={clientData.email}
          phone={clientData.phone}
          membershipType={clientData.membershipType}
          selectedPeriod={clientData.selected_period}
        />

        <PaymentHistory payments={MOCK_PAYMENTS} primaryColor={primaryColor} />
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 pb-8 flex-row gap-4 mt-2">
        <ButtonCustom
          title="Editar Cliente"
          onPress={() => {
            // TODO: Implementar edición
            console.log("Editar cliente");
          }}
          width="flex"
          disabled={deleting}
        />
        <ButtonCustom
          title={deleting ? "Eliminando..." : "Eliminar"}
          secondary
          onPress={onDeleteClient}
          width="flex"
          disabled={deleting}
        />
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={3000}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

export default UserDetailsScreen;
