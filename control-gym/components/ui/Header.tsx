import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Avatar from "./Avatar";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  avatarUrl?: string;
  username?: string;
}
const Header = ({ avatarUrl, username }: HeaderProps) => {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.push("/screens/profile-screen")}
          activeOpacity={0.7}
        >
          <Avatar uri={avatarUrl} name={username} size="md" />
        </TouchableOpacity>

        <View>
          <Text
            style={{ color: colors.textSecondary }}
            className="font-bold text-md"
          >
            Bienvenido,
          </Text>
          <Text style={{ color: colors.text }} className="text-lg font-bold">
            {username || "Usuario"}
          </Text>
        </View>
      </View>
      <View>
        <MaterialIcons
          name="notifications-none"
          size={30}
          color={colors.textSecondary}
          style={{ marginLeft: 8 }}
        />
      </View>
    </View>
  );
};

export default Header;
