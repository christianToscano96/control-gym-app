import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface InfoCardProps {
  cardColor: string;
  primaryColor: string;
  textColor: string;
  textSecondaryColor: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  cardColor,
  primaryColor,
  textColor,
  textSecondaryColor,
}) => {
  return (
    <View
      style={[styles.infoCard, { backgroundColor: cardColor }]}
      className="rounded-3xl p-6 mb-6"
    >
      <View className="items-center mb-6">
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${primaryColor}20` },
          ]}
          className="rounded-full p-6 mb-4"
        >
          <MaterialIcons
            name="qr-code-scanner"
            size={64}
            color={primaryColor}
          />
        </View>
        <Text
          style={{ color: textColor }}
          className="text-xl font-bold text-center"
        >
          Escaneo de Código QR
        </Text>
      </View>

      <View className="space-y-4">
        <View className="flex-row items-start">
          <MaterialIcons
            name="check-circle"
            size={24}
            color={primaryColor}
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <Text
              style={{ color: textColor }}
              className="text-base font-semibold"
            >
              Verifica el acceso
            </Text>
            <Text style={{ color: textSecondaryColor }} className="text-sm">
              Escanea el código QR de la membresía del cliente
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <MaterialIcons
            name="verified"
            size={24}
            color={primaryColor}
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <Text
              style={{ color: textColor }}
              className="text-base font-semibold"
            >
              Registro automático
            </Text>
            <Text style={{ color: textSecondaryColor }} className="text-sm">
              El acceso se registra automáticamente en el sistema
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <MaterialIcons
            name="flash-on"
            size={24}
            color={primaryColor}
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <Text
              style={{ color: textColor }}
              className="text-base font-semibold"
            >
              Usa la linterna
            </Text>
            <Text style={{ color: textSecondaryColor }} className="text-sm">
              Activa el flash en condiciones de poca luz
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
