import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

interface CameraScannerProps {
  scanned: boolean;
  flashEnabled: boolean;
  primaryColor: string;
  cardColor: string;
  textColor: string;
  onBarCodeScanned: (data: { type: string; data: string }) => void;
  onToggleFlash: () => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  scanned,
  flashEnabled,
  primaryColor,
  cardColor,
  textColor,
  onBarCodeScanned,
  onToggleFlash,
  onClose,
}) => {
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Overlay with scan area */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />

          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />

            <View
              style={[
                styles.scanArea,
                {
                  width: SCAN_AREA_SIZE,
                  height: SCAN_AREA_SIZE,
                  borderColor: primaryColor,
                },
              ]}
            >
              {/* Corner decorations */}
              <View
                style={[
                  styles.corner,
                  styles.cornerTopLeft,
                  { borderColor: primaryColor },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.cornerTopRight,
                  { borderColor: primaryColor },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.cornerBottomLeft,
                  { borderColor: primaryColor },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.cornerBottomRight,
                  { borderColor: primaryColor },
                ]}
              />
            </View>

            <View style={styles.overlaySide} />
          </View>

          <View style={styles.overlayBottom}>
            <Text className="text-white text-center text-lg font-semibold mb-4">
              Alinea el código QR dentro del marco
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: cardColor }]}
            onPress={onToggleFlash}
          >
            <MaterialIcons
              name={flashEnabled ? "flash-on" : "flash-off"}
              size={28}
              color={textColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: cardColor }]}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={28} color={textColor} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  scanArea: {
    borderWidth: 2,
    borderRadius: 20,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  controls: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
