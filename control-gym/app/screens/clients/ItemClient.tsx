import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ItemClientProps {
  clientId: string;
  avatarUri?: string;
  name: string;
  status: string;
}

const ItemClient = ({ clientId, avatarUri, name, status }: ItemClientProps) => {
  const { colors } = useTheme();
  console.log(clientId);
  return (
    <View
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      className="w-full h-20 rounded-2xl mb-3 border flex-row items-center p-3 relative"
    >
      <Avatar size="sm" uri={avatarUri} />
      <Text
        style={{ color: colors.text }}
        className="flex-1 text-lg font-semibold ml-4"
      >
        {name || "John Doe"}
      </Text>
      <View className="mr-1">
        <Badge label={status || "None"} />
      </View>
      <View>
        <MaterialIcons
          name="chevron-right"
          size={28}
          color={colors.textSecondary}
          onPress={() =>
            router.push({
              pathname: "/screens/clients/client-details",
              params: { clientId },
            })
          }
        />
      </View>
    </View>
  );
};

export default ItemClient;
