import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

interface ItemClientProps {
  clientId: string;
  avatarUri?: string;
  name: string;
  status: string;
}

const ItemClient = ({ clientId, avatarUri, name, status }: ItemClientProps) => {
  console.log(clientId);
  return (
    <View className="w-full h-20 bg-white rounded-2xl mb-3  border border-gray-100 flex-row items-center p-3 relative">
      <Avatar size="sm" uri={avatarUri} />
      <Text className="flex-1 text-lg font-semibold ml-4">
        {name || "John Doe"}
      </Text>
      <View className="mr-1">
        <Badge label={status || "None"} />
      </View>
      <View>
        <MaterialIcons
          name="chevron-right"
          size={28}
          color="#686868"
          onPress={() =>
            router.push({
              pathname: "/screens/clients-screen/client-details",
              params: { clientId },
            })
          }
        />
      </View>
    </View>
  );
};

export default ItemClient;
