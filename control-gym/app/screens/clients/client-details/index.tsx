import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { useClientDetailQuery, useClientPaymentsQuery, useDeleteClient } from "@/hooks/queries/useClients";
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
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClientHeader } from "./components/ClientHeader";
import { ClientInfoCard } from "./components/ClientInfoCard";
import { PaymentHistory } from "./components/PaymentHistory";
import { StatsCards } from "./components/StatsCards";

const UserDetailsScreen = () => {
  const { clientId } = useLocalSearchParams();
  const { primaryColor, colors, isDark } = useTheme();
  const { toast, showSuccess, showError, hideToast } = useToast();

  // ─── TanStack Query ──────────────────────────────────────────
  const {
    data: clientData,
    isLoading: loading,
    error: queryError,
  } = useClientDetailQuery(clientId as string);

  const {
    data: payments = [],
    isLoading: loadingPayments,
  } = useClientPaymentsQuery(clientId as string);

  const deleteClientMutation = useDeleteClient();
  const deleting = deleteClientMutation.isPending;

  const error = queryError?.message || "";

  // Derived state
  const fullName =
    `${clientData?.firstName || ""} ${clientData?.lastName || ""}`.trim();

  // Membership expiration calculations
  const expirationDate = calculateExpirationDate(
    clientData?.membershipStartDate,
    clientData?.createdAt,
    clientData?.selected_period,
  );
  const expired = hasExpired(expirationDate);
  const expiringSoon = isExpiringSoon(expirationDate);
  const expirationDateText = formatDate(expirationDate);
  const expirationLabel = expired ? "Expiro" : "Valido hasta";
  const daysLeft = expirationDate
    ? Math.ceil(
        (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : undefined;

  const onDeleteClient = () => {
    Alert.alert(
      "Eliminar Cliente",
      `Estas seguro de que deseas eliminar a ${clientData?.firstName || "este cliente"}? Esta accion no se puede deshacer.`,
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={primaryColor} />
          <Text
            style={{
              marginTop: 16,
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            Cargando informacion...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 24 }}>
          <HeaderTopScrenn title="Detalles" isBackButton />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <MaterialIcons name="error-outline" size={56} color={colors.error} />
          <Text
            style={{
              marginTop: 16,
              textAlign: "center",
              fontSize: 16,
              color: colors.error,
            }}
          >
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!clientData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 24 }}>
          <HeaderTopScrenn title="Detalles" isBackButton />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <MaterialIcons
            name="person-off"
            size={56}
            color={colors.textSecondary}
          />
          <Text
            style={{
              marginTop: 16,
              textAlign: "center",
              fontSize: 16,
              color: colors.textSecondary,
            }}
          >
            No se encontro el cliente.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16 }}>
        <HeaderTopScrenn title="Detalles" isBackButton />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <ClientHeader
          avatarUri={clientData.avatarUri}
          fullName={fullName}
          isActive={clientData.isActive}
          membershipType={clientData.membershipType}
        />

        <StatsCards
          primaryColor={primaryColor}
          attendanceCount={clientData.attendanceCount || 0}
          expirationDateText={expirationDateText}
          expirationLabel={expirationLabel}
          hasExpired={expired}
          isExpiringSoon={expiringSoon}
          statusLabel={clientData.isActive ? "Activo" : "Inactivo"}
          isActive={clientData.isActive}
          daysLeft={daysLeft}
        />

        <ClientInfoCard
          email={clientData.email}
          phone={clientData.phone}
          membershipType={clientData.membershipType}
          selectedPeriod={clientData.selected_period}
          dni={clientData.dni}
        />

        <PaymentHistory
          payments={payments}
          primaryColor={primaryColor}
          loading={loadingPayments}
        />
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          paddingTop: 8,
          flexDirection: "row",
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            // TODO: Implementar edicion
            console.log("Editar cliente");
          }}
          disabled={deleting}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: primaryColor,
            borderRadius: 14,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: deleting ? 0.5 : 1,
          }}
        >
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDeleteClient}
          disabled={deleting}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: isDark ? "#DC262620" : "#FEE2E2",
            borderRadius: 14,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: deleting ? 0.5 : 1,
          }}
        >
          <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
          <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 15 }}>
            {deleting ? "Eliminando..." : "Eliminar"}
          </Text>
        </TouchableOpacity>
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
