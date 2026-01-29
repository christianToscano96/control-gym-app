import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
  return (
    <View className="px-4 mb-3">
      <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <MaterialIcons name="email" size={18} color="#64748B" />
            <Text
              className="text-sm text-gray-900 ml-2 flex-1"
              numberOfLines={1}
            >
              {email || "No registrado"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <MaterialIcons name="phone" size={18} color="#64748B" />
            <Text className="text-sm text-gray-900 ml-2">
              {phone || "No registrado"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="card-membership" size={18} color="#64748B" />
            <Text className="text-sm text-gray-900 ml-2">
              {membershipType || "Básico"} • {selectedPeriod || "Mensual"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
