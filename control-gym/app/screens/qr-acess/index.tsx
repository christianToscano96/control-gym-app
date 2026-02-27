import React, { useState, useMemo, useRef } from "react";
import { Text, View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { CameraScanner } from "./CameraScanner";
import { InfoCard } from "./InfoCard";
import { ManualEntryModal } from "./ManualEntryModal";
import { PermissionLoadingView, PermissionDeniedView } from "./PermissionViews";
import { useClientsQuery } from "@/hooks/queries/useClients";
import { apiClient } from "@/api/client";
import { AccessResultCard, AccessResult } from "./AccessResultCard";
import { queryKeys } from "@/hooks/queries/queryKeys";

const QRAccessScreen = () => {
  const { colors, primaryColor } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null);
  const [validating, setValidating] = useState(false);
  const isProcessingRef = useRef(false);

  // ─── TanStack Query ──────────────────────────────────────────
  const queryClient = useQueryClient();
  const { data: clients = [], isLoading: loading } = useClientsQuery();

  // Filtrar clientes por búsqueda (devuelve múltiples resultados)
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2 || clients.length === 0) return [];
    const q = searchQuery.toLowerCase();
    return clients.filter((client: any) => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      return fullName.includes(q);
    });
  }, [searchQuery, clients]);

  const resetScanState = () => {
    isProcessingRef.current = false;
    setScanned(false);
    setAccessResult(null);
  };

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setScanned(true);
    setCameraActive(false);
    setValidating(true);

    try {
      const response = await apiClient<AccessResult>(
        "/api/access/validate-qr",
        {
          method: "POST",
          body: { clientId: data },
        },
      );
      setAccessResult(response);

      // Invalidar queries del dashboard si el acceso fue exitoso
      if (response.allowed) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
        queryClient.invalidateQueries({ queryKey: queryKeys.access.recent });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.weeklyAttendance });
      }
    } catch (error: any) {
      setAccessResult({
        allowed: false,
        clientName: "Error",
        message: error?.message || "No se pudo validar el código QR",
      });
    } finally {
      setValidating(false);
    }
  };

  const startScanning = () => {
    setScanned(false);
    setCameraActive(true);
  };

  const stopScanning = () => {
    setCameraActive(false);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const openManualEntry = () => {
    setManualEntryVisible(true);
    setSearchQuery("");
    setSelectedClient(null);
  };

  const closeManualEntry = () => {
    setManualEntryVisible(false);
    setSearchQuery("");
    setSelectedClient(null);
  };

  const handleManualAccess = async () => {
    if (selectedClient) {
      try {
        const response = await apiClient<AccessResult>(
          "/api/access/validate-qr",
          {
            method: "POST",
            body: { clientId: selectedClient._id },
          },
        );
        closeManualEntry();
        setAccessResult(response);

        // Invalidar queries del dashboard si el acceso fue exitoso
        if (response.allowed) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.dashboard.stats,
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.access.recent });
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.weeklyAttendance });
        }
      } catch (error: any) {
        Alert.alert(
          "Error",
          error?.message || "No se pudo registrar el acceso",
          [{ text: "OK" }],
        );
      }
    }
  };

  const handleDenyAccess = () => {
    if (selectedClient) {
      const fullName = `${selectedClient.firstName} ${selectedClient.lastName}`;
      Alert.alert("Acceso Denegado", `Acceso denegado para ${fullName}`, [
        {
          text: "OK",
          onPress: () => closeManualEntry(),
        },
      ]);
    }
  };

  if (!permission) {
    return (
      <PermissionLoadingView
        backgroundColor={colors.background}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
      />
    );
  }

  if (!permission.granted) {
    return (
      <PermissionDeniedView
        backgroundColor={colors.background}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
        onRetry={requestPermission}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <Text
          style={{ color: colors.text }}
          className="text-3xl font-bold mb-2"
        >
          Control de Acceso
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-base">
          Escanea el código QR de los clientes
        </Text>
      </View>

      {/* Camera View */}
      {cameraActive ? (
        <CameraScanner
          scanned={scanned}
          flashEnabled={flashEnabled}
          primaryColor={primaryColor}
          cardColor={colors.card}
          textColor={colors.text}
          onBarCodeScanned={handleBarCodeScanned}
          onToggleFlash={toggleFlash}
          onClose={stopScanning}
        />
      ) : validating ? (
        <View className="flex-1 items-center justify-center px-6">
          <View
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            className="w-full rounded-3xl border p-8 items-center"
          >
            <ActivityIndicator size="large" color={primaryColor} />
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold mt-4"
            >
              Validando acceso...
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-sm mt-1 text-center"
            >
              Verificando membresía del cliente
            </Text>
          </View>
        </View>
      ) : accessResult ? (
        <AccessResultCard
          result={accessResult}
          cardColor={colors.card}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
          borderColor={colors.border}
          onScanAnother={() => {
            resetScanState();
            setCameraActive(true);
          }}
          onClose={resetScanState}
        />
      ) : (
        <View style={styles.infoContainer} className="px-6 flex-1">
          <InfoCard
            cardColor={colors.card}
            primaryColor={primaryColor}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
          />

          {/* Action Buttons */}
          <View className="w-full mb-8 gap-3">
            <ButtonCustom title="Iniciar Escaneo" onPress={startScanning} />

            <ButtonCustom
              title="Ingreso Manual"
              onPress={openManualEntry}
              secondary
            />
          </View>
        </View>
      )}

      <ManualEntryModal
        visible={manualEntryVisible}
        searchQuery={searchQuery}
        searchResults={searchResults}
        selectedClient={selectedClient}
        backgroundColor={colors.background}
        cardColor={colors.card}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
        primaryColor={primaryColor}
        loading={loading}
        onClose={closeManualEntry}
        onSearchChange={setSearchQuery}
        onSelectClient={setSelectedClient}
        onConfirm={handleManualAccess}
        onDeny={handleDenyAccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
});

export default QRAccessScreen;
