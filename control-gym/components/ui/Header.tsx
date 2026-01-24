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
        <Text>Bienvenido,</Text>
        <Text>{username || "Usuario"}</Text>
      </View>
    </View>
  );
};

export default Header;
