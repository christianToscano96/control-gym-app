import React from "react";
import { Text, View } from "react-native";
import Avatar from "@/components/ui/Avatar";

interface ClientHeaderProps {
  avatarUri?: string;
  fullName: string;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  avatarUri,
  fullName,
}) => {
  return (
    <View className="bg-white items-center py-3 px-6 mb-3">
      <Avatar size="lg" uri={avatarUri} name={fullName} className="mb-3" />
      <Text className="text-xl font-bold text-neutral-900">
        {fullName || "Sin nombre"}
      </Text>
    </View>
  );
};
