import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ExpiringMembershipsAlertProps {
  count: number;
  onPress?: () => void;
}

const ExpiringMembershipsAlert: React.FC<ExpiringMembershipsAlertProps> = ({
  count,
  onPress,
}) => {
  if (count === 0) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ backgroundColor: "#FEF3C7" }}
      className="rounded-2xl p-4 mx-1 my-2 flex-row items-center"
    >
      <View
        style={{ backgroundColor: "#FDE68A" }}
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
      >
        <MaterialIcons name="warning" size={22} color="#D97706" />
      </View>
      <View className="flex-1">
        <Text style={{ color: "#92400E" }} className="text-sm font-bold">
          {count} {count === 1 ? "membresía vence" : "membresías vencen"} esta
          semana
        </Text>
        <Text style={{ color: "#B45309" }} className="text-xs mt-0.5">
          Toca para ver detalles
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#D97706" />
    </TouchableOpacity>
  );
};

export default ExpiringMembershipsAlert;
