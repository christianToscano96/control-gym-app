import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface ClientInfoCardProps {
  email?: string;
  phone?: string;
  membershipType?: string;
  selectedPeriod?: string;
  dni?: string;
}

const membershipLabels: Record<string, string> = {
  basico: "Basico",
  pro: "Pro",
  proplus: "Pro+",
};

interface InfoRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  iconColor: string;
  textColor: string;
  secondaryColor: string;
  isLast?: boolean;
  borderColor: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  iconColor,
  textColor,
  secondaryColor,
  isLast,
  borderColor,
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: borderColor,
    }}
  >
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: iconColor + "12",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialIcons name={icon} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ fontSize: 11, color: secondaryColor, fontWeight: "500", marginBottom: 2 }}>
        {label}
      </Text>
      <Text
        style={{ fontSize: 14, color: textColor, fontWeight: "500" }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  </View>
);

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({
  email,
  phone,
  membershipType,
  selectedPeriod,
  dni,
}) => {
  const { colors, primaryColor, isDark } = useTheme();

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        Informacion
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          paddingHorizontal: 16,
          borderWidth: isDark ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        <InfoRow
          icon="email"
          label="Correo electronico"
          value={email || "No registrado"}
          iconColor={primaryColor}
          textColor={colors.text}
          secondaryColor={colors.textSecondary}
          borderColor={colors.border}
        />
        <InfoRow
          icon="phone"
          label="Telefono"
          value={phone || "No registrado"}
          iconColor={primaryColor}
          textColor={colors.text}
          secondaryColor={colors.textSecondary}
          borderColor={colors.border}
        />
        {dni && (
          <InfoRow
            icon="badge"
            label="DNI"
            value={dni}
            iconColor={primaryColor}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
            borderColor={colors.border}
          />
        )}
        <InfoRow
          icon="card-membership"
          label="Membresia"
          value={`${membershipLabels[membershipType || ""] || membershipType || "Basico"} • ${selectedPeriod || "Mensual"}`}
          iconColor={primaryColor}
          textColor={colors.text}
          secondaryColor={colors.textSecondary}
          borderColor={colors.border}
          isLast
        />
      </View>
    </View>
  );
};
