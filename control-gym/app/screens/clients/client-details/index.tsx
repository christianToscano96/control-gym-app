import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/useToast";
import { useUserStore } from "@/stores/store";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClientDetails } from "@/hooks/useClientDetails";
import { useClientActions } from "@/hooks/useClientActions";
import {
  calculateExpirationDate,
  formatDate,
  hasExpired,
  isExpiringSoon,
} from "@/utils/membershipUtils";
import { ClientHeader } from "./components/ClientHeader";
import { StatsCards } from "./components/StatsCards";
import { ClientInfoCard } from "./components/ClientInfoCard";
import { PaymentHistory } from "./components/PaymentHistory";

const UserDetailsScreen = () => {
  const { clientId } = useLocalSearchParams();
  const { user } = useUserStore();
  const { primaryColor, colors } = useTheme();
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Custom hooks
  const { clientData, payments, loading, error } = useClientDetails(
    user?.token,
    clientId,
  );
  const { deleting, handleDeleteClient } = useClientActions();

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
    handleDeleteClient(
      clientData?.firstName,
      clientId,
      user?.token,
      () => showSuccess("Cliente eliminado correctamente"),
      (message) => showError(message),
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

        <PaymentHistory payments={payments} primaryColor={primaryColor} />
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
