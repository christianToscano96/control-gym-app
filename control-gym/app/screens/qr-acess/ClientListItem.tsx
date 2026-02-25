import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface Client {
  id: number;
  name: string;
  membership: string;
  active: boolean;
}

interface ClientListItemProps {
  client: Client;
  isSelected: boolean;
  cardColor: string;
  primaryColor: string;
  textColor: string;
  onPress: () => void;
}

export const ClientListItem: React.FC<ClientListItemProps> = React.memo(({
  client,
  isSelected,
  cardColor,
  primaryColor,
  textColor,
  onPress,
}) => {
  const statusColor = useMemo(
    () => (client.active ? "#10b981" : "#ef4444"),
    [client.active]
  );

  const statusBgColor = useMemo(
    () => (client.active ? "#10b98120" : "#ef444420"),
    [client.active]
  );

  const membershipBadgeStyle = useMemo(
    () => [styles.membershipBadge, { backgroundColor: `${primaryColor}20` }],
    [primaryColor]
  );

  const containerStyle = useMemo(
    () => [
      styles.clientItem,
      {
        backgroundColor: cardColor,
        borderColor: isSelected ? primaryColor : "transparent",
      },
    ],
    [cardColor, isSelected, primaryColor]
  );

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text style={{ color: textColor }} className="text-lg font-bold">
            {client.name}
          </Text>
          {isSelected && (
            <MaterialIcons name="check-circle" size={24} color={primaryColor} />
          )}
        </View>
        <View className="flex-row items-center gap-2">
          <View style={membershipBadgeStyle}>
            <Text
              style={{ color: primaryColor }}
              className="text-xs font-semibold"
            >
              {client.membership}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusBgColor },
            ]}
          >
            <Text
              style={{ color: statusColor }}
              className="text-xs font-semibold"
            >
              {client.active ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  clientItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  membershipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
