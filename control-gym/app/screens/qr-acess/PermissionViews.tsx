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
  primaryColor: string;
  onRetry: () => void;
  onManualEntry: () => void;
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
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: `${textSecondaryColor}15`,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <MaterialIcons name="camera" size={48} color={textSecondaryColor} />
      </View>
      <Text style={{ color: textColor }} className="text-lg font-semibold mt-4">
        Solicitando permiso de cámara...
      </Text>
      <Text
        style={{ color: textSecondaryColor }}
        className="text-sm mt-2 text-center px-8"
      >
        Necesitamos acceso a tu cámara para escanear códigos QR
      </Text>
    </View>
  );
};

export const PermissionDeniedView: React.FC<PermissionDeniedViewProps> = ({
  backgroundColor,
  textColor,
  textSecondaryColor,
  primaryColor,
  onRetry,
  onManualEntry,
}) => {
  return (
    <View
      style={[styles.container, { backgroundColor }]}
      className="justify-center items-center px-6"
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: `${primaryColor}15`,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <MaterialIcons name="no-photography" size={48} color={primaryColor} />
      </View>
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
        Habilita los permisos de cámara en la configuración de tu dispositivo
        para escanear códigos QR.
      </Text>
      <View className="w-full mt-8 gap-3">
        <ButtonCustom title="Reintentar Permiso" onPress={onRetry} />
        <ButtonCustom
          title="Ingreso Manual"
          onPress={onManualEntry}
          secondary
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
