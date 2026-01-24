import React from "react";
import { Text, View } from "react-native";
import Avatar from "./Avatar";

interface HeaderProps {
  avatarUrl?: string;
  username?: string;
}
const Header = ({ avatarUrl, username }: HeaderProps) => {
  return (
    <View className="flex flex-row items-center gap-4">
      <View>
        <Avatar uri={avatarUrl} name={username} size="md" />
      </View>
      <View>
        <Text className="font-bold text-gray-500 text-md">Bienvenido,</Text>
        <Text className="text-lg font-bold">{username || "Usuario"}</Text>
      </View>
    </View>
  );
};

export default Header;
