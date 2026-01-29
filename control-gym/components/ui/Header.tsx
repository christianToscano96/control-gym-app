import React from "react";
import { Text, View } from "react-native";
import Avatar from "./Avatar";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

interface HeaderProps {
  avatarUrl?: string;
  username?: string;
}
const Header = ({ avatarUrl, username }: HeaderProps) => {
  return (
    <View className="flex-row items-center justify-between">
      <View
        className="flex flex-row items-center gap-4"
        onTouchEnd={() => router.push("/screens/profile-screen")}
      >
        <Avatar uri={avatarUrl} name={username} size="md" />
        <View>
          <Text className="font-bold text-gray-500 text-md">Bienvenido,</Text>
          <Text className="text-lg font-bold">{username || "Usuario"}</Text>
        </View>
      </View>
      <View>
        <MaterialIcons
          name="notifications-none"
          size={30}
          color="#64748B"
          style={{ marginLeft: 8 }}
        />
      </View>
    </View>
  );
};

export default Header;
