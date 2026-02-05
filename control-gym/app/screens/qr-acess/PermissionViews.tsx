import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ButtonCustom from "@/components/ui/ButtonCustom";

interface PermissionViewProps {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
}

interface PermissionDeniedViewProps extends PermissionViewProps {
  onRetry: () => void;
}

export const PermissionLoadingView: React.FC<PermissionViewProps> = ({
  backgroundColor,
  textColor,
  textSecondaryColor,
}) => {
  return (
    <View
      style={[styles.container, { backgroundColor }]}
      className="justify-center items-center"
    >
      <MaterialIcons name="camera" size={64} color={textSecondaryColor} />
      <Text style={{ color: textColor }} className="text-lg font-semibold mt-4">
        Solicitando permiso de cámara...
      </Text>
    </View>
  );
};

export const PermissionDeniedView: React.FC<PermissionDeniedViewProps> = ({
  backgroundColor,
  textColor,
  textSecondaryColor,
  onRetry,
}) => {
  return (
    <View
      style={[styles.container, { backgroundColor }]}
      className="justify-center items-center px-6"
    >
      <MaterialIcons
        name="no-photography"
        size={64}
        color={textSecondaryColor}
      />
      <Text
        style={{ color: textColor }}
        className="text-xl font-bold mt-4 text-center"
      >
        Sin acceso a la cámara
      </Text>
      <Text
        style={{ color: textSecondaryColor }}
        className="text-base mt-2 text-center"
      >
        Por favor, habilita los permisos de cámara en la configuración de tu
        dispositivo para escanear códigos QR.
      </Text>
      <View className="w-full mt-6">
        <ButtonCustom title="Reintentar" onPress={onRetry} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
