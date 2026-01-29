import React from "react";
import { Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";
import { useTheme } from "@/context/ThemeContext";

interface ClientHeaderProps {
  avatarUri?: string;
  fullName: string;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  avatarUri,
  fullName,
}) => {
  const { colors } = useTheme();

  return (
    <View
      className="items-center py-3 px-6 mb-3"
      style={{ backgroundColor: colors.card }}
    >
      <Avatar size="lg" uri={avatarUri} name={fullName} className="mb-3" />
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        {fullName || "Sin nombre"}
      </Text>
    </View>
  );
};
