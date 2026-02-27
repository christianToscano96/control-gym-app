import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

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
  // Animated scan line
  const scanLineY = useSharedValue(0);
  const scanLinePulse = useSharedValue(0.6);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(SCAN_AREA_SIZE - 4, {
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    scanLinePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100 }),
        withTiming(0.6, { duration: 1100 }),
      ),
      -1,
      false,
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: scanLinePulse.value,
  }));

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Overlay with scan area */}
      <View style={[styles.overlay, StyleSheet.absoluteFill]}>
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
            {/* Animated scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { backgroundColor: primaryColor },
                  scanLineStyle,
                ]}
              />
            )}

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
          <View style={styles.instructionContainer}>
            <MaterialIcons
              name="qr-code-scanner"
              size={20}
              color="rgba(255,255,255,0.9)"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.instructionText}>
              Alinea el código QR dentro del marco
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: cardColor }]}
          onPress={onToggleFlash}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={flashEnabled ? "flash-on" : "flash-off"}
            size={28}
            color={flashEnabled ? "#F59E0B" : textColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: cardColor }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <MaterialIcons name="close" size={28} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
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
    alignItems: "center",
    paddingHorizontal: 24,
  },
  scanArea: {
    borderWidth: 2,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
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
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  instructionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
  },
});
