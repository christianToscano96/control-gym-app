import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface ClientInfoCardProps {
  email?: string;
  phone?: string;
  membershipType?: string;
  selectedPeriod?: string;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({
  email,
  phone,
  membershipType,
  selectedPeriod,
}) => {
  const { colors } = useTheme();

  return (
    <View className="px-4 mb-3">
      <View
        className="rounded-2xl p-4 shadow-sm shadow-black/5"
        style={{ backgroundColor: colors.card }}
      >
        <View
          className="flex-row items-center justify-between mb-3 pb-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center flex-1">
            <MaterialIcons
              name="email"
              size={18}
              color={colors.textSecondary}
            />
            <Text
              className="text-sm ml-2 flex-1"
              numberOfLines={1}
              style={{ color: colors.text }}
            >
              {email || "No registrado"}
            </Text>
          </View>
        </View>

        <View
          className="flex-row items-center justify-between mb-3 pb-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center">
            <MaterialIcons
              name="phone"
              size={18}
              color={colors.textSecondary}
            />
            <Text className="text-sm ml-2" style={{ color: colors.text }}>
              {phone || "No registrado"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons
              name="card-membership"
              size={18}
              color={colors.textSecondary}
            />
            <Text className="text-sm ml-2" style={{ color: colors.text }}>
              {membershipType || "Básico"} • {selectedPeriod || "Mensual"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
