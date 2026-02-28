import React, { useState, useMemo, useRef, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
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

  // Pulse animation for validating state
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (validating) {
      pulseScale.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true,
      );
    } else {
      pulseScale.value = 1;
    }
  }, [validating]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

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

    // Haptic feedback al escanear
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await apiClient<AccessResult>(
        "/api/access/validate-qr",
        {
          method: "POST",
          body: { clientId: data },
        },
      );
      setAccessResult(response);

      // Haptic feedback según resultado
      if (response.allowed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Invalidar queries del dashboard (tanto permitidos como rechazados se registran)
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.access.recent });
      if (response.allowed) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.weeklyAttendance,
        });
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        if (response.allowed) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          queryClient.invalidateQueries({
            queryKey: queryKeys.dashboard.weeklyAttendance,
          });
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        // Invalidar queries del dashboard (tanto permitidos como rechazados se registran)
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.stats,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.access.recent });
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
        primaryColor={primaryColor}
        onRetry={requestPermission}
        onManualEntry={openManualEntry}
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
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-1 items-center justify-center px-6"
        >
          <Animated.View
            style={[
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 24,
                padding: 32,
                width: "100%",
                alignItems: "center",
              },
              pulseStyle,
            ]}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: `${primaryColor}20`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <MaterialIcons
                name="qr-code-scanner"
                size={36}
                color={primaryColor}
              />
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold mt-2"
            >
              Validando acceso...
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-sm mt-2 text-center"
            >
              Verificando membresía del cliente
            </Text>
            <View
              style={{
                marginTop: 20,
                width: 120,
                height: 4,
                borderRadius: 2,
                backgroundColor: `${primaryColor}30`,
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: primaryColor,
                  borderRadius: 2,
                }}
              />
            </View>
          </Animated.View>
        </Animated.View>
      ) : accessResult ? (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ flex: 1 }}
        >
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
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.infoContainer}
          className="px-6 flex-1"
        >
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
        </Animated.View>
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
