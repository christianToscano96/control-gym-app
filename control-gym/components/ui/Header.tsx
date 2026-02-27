import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Avatar from "./Avatar";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días,";
  if (hour < 19) return "Buenas tardes,";
  return "Buenas noches,";
}

function getTodayDate(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

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
          onPress={() => router.push("/screens/profile")}
          activeOpacity={0.7}
        >
          <Avatar uri={avatarUrl} name={username} size="md" />
        </TouchableOpacity>

        <View>
          <Text
            style={{ color: colors.textSecondary }}
            className="font-bold text-md"
          >
            {getGreeting()}
          </Text>
          <Text style={{ color: colors.text }} className="text-lg font-bold">
            {username || "Usuario"}
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs mt-0.5 capitalize"
          >
            {getTodayDate()}
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
