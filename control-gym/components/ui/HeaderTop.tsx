import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface HeaderTopProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  addIcon?: boolean;
  showBackButton?: boolean;
}

const HeaderTop = ({
  title,
  icon,
  addIcon = false,
  showBackButton = true,
}: HeaderTopProps) => {
  const { primaryColor } = useTheme();

  return (
    <View className="flex flex-row items-center mb-5 gap-4 border-b-2 pb-2 border-gray-100 pr-6">
      {showBackButton && (
        <MaterialIcons
          name={icon}
          size={24}
          color="#686868"
          onPress={() => router.back()}
        />
      )}
      {!showBackButton && (
        <MaterialIcons name={icon} size={24} color="#686868" className="pl-3" />
      )}
      <Text style={{ fontSize: 24, fontWeight: "bold", flex: 1 }}>{title}</Text>

      {addIcon && (
        <View
          className="w-9 h-9 rounded-full justify-center items-center"
          style={{ backgroundColor: primaryColor }}
        >
          <MaterialIcons
            name="add"
            size={24}
            color="white"
            onPress={() =>
              router.push("/screens/client-screen/NewClientScreen")
            }
          />
        </View>
      )}
    </View>
  );
};

export default HeaderTop;
