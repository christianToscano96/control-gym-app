import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useTheme } from "@/context/ThemeContext";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { CameraScanner } from "./CameraScanner";
import { InfoCard } from "./InfoCard";
import { ManualEntryModal } from "./ManualEntryModal";
import { PermissionLoadingView, PermissionDeniedView } from "./PermissionViews";
import { fetchClients } from "@/api/clients";
import { useUserStore } from "@/stores/store";

const QRAccessScreen = () => {
  const { colors, primaryColor } = useTheme();
  const user = useUserStore((state) => state.user);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Efecto para buscar automáticamente cuando el usuario escribe
  useEffect(() => {
    if (searchQuery.length >= 3 && clients.length > 0) {
      const found = clients.find((client: any) => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      if (found) {
        console.log("Cliente encontrado:", found);
        setSelectedClient(found);
      } else {
        setSelectedClient(null);
      }
    } else {
      setSelectedClient(null);
    }
  }, [searchQuery, clients]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setCameraActive(false);

    // Aquí puedes procesar el código QR escaneado
    Alert.alert("¡Código QR Escaneado!", `Tipo: ${type}\nDatos: ${data}`, [
      {
        text: "Escanear Otro",
        onPress: () => {
          setScanned(false);
          setCameraActive(true);
        },
      },
      {
        text: "OK",
        onPress: () => setScanned(false),
      },
    ]);
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

  const loadClients = useCallback(async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      Alert.alert("Error", "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const openManualEntry = async () => {
    setManualEntryVisible(true);
    setSearchQuery("");
    setSelectedClient(null);
    await loadClients();
  };

  const closeManualEntry = () => {
    setManualEntryVisible(false);
    setSearchQuery("");
    setSelectedClient(null);
    setClients([]);
  };

  const handleManualAccess = () => {
    if (selectedClient) {
      const fullName = `${selectedClient.firstName} ${selectedClient.lastName}`;
      Alert.alert(
        "Acceso Registrado",
        `Acceso registrado para ${fullName}`,
        [
          {
            text: "OK",
            onPress: () => closeManualEntry(),
          },
        ],
      );
      // Aquí puedes llamar a tu API para registrar el acceso
    }
  };

  const handleDenyAccess = () => {
    if (selectedClient) {
      const fullName = `${selectedClient.firstName} ${selectedClient.lastName}`;
      Alert.alert(
        "Acceso Denegado",
        `Acceso denegado para ${fullName}`,
        [
          {
            text: "OK",
            onPress: () => closeManualEntry(),
          },
        ],
      );
      // Aquí puedes llamar a tu API para registrar el acceso denegado
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
        filteredClients={clients}
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
