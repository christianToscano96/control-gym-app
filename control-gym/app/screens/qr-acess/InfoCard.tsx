import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface InfoCardProps {
  cardColor: string;
  primaryColor: string;
  textColor: string;
  textSecondaryColor: string;
}

const features = [
  {
    icon: "verified" as const,
    title: "Verifica y registra",
    desc: "El acceso se valida y registra automáticamente",
  },
  {
    icon: "flash-on" as const,
    title: "Flash disponible",
    desc: "Activa la linterna en poca luz",
  },
];

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
      <View className="items-center mb-5">
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${primaryColor}20` },
          ]}
          className="rounded-full p-5 mb-3"
        >
          <MaterialIcons
            name="qr-code-scanner"
            size={56}
            color={primaryColor}
          />
        </View>
        <Text
          style={{ color: textColor }}
          className="text-xl font-bold text-center"
        >
          Escaneo de Código QR
        </Text>
        <Text
          style={{ color: textSecondaryColor }}
          className="text-sm text-center mt-1"
        >
          Escanea la membresía del cliente para dar acceso
        </Text>
      </View>

      <View className="gap-3">
        {features.map((f) => (
          <View key={f.icon} className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <MaterialIcons name={f.icon} size={18} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Text
                style={{ color: textColor }}
                className="text-sm font-semibold"
              >
                {f.title}
              </Text>
              <Text
                style={{ color: textSecondaryColor }}
                className="text-xs"
              >
                {f.desc}
              </Text>
            </View>
          </View>
        ))}
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
