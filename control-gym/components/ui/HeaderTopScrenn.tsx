import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderTopScrennProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  isAddClient?: boolean;
  isBackButton?: boolean;
}

const HeaderTopScrenn = ({
  icon,
  title,
  isAddClient,
  isBackButton,
}: HeaderTopScrennProps) => {
  const { primaryColor } = useTheme();

  return (
    <View className="flex flex-row items-center mb-5 gap-4 border-b-2 pb-2 border-gray-100 pr-4">
      {isBackButton ? (
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name={icon || "arrow-back"}
            size={24}
            color="#686868"
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 4 }} />
      )}
      <Text style={{ fontSize: 24, fontWeight: "bold", flex: 1 }}>{title}</Text>
      {isAddClient && (
        <View
          className="w-9 h-9 rounded-full justify-center items-center"
          style={{ backgroundColor: primaryColor }}
        >
          <MaterialIcons
            name="add"
            size={24}
            color="white"
            onPress={() =>
              router.push("/screens/clients-screen/NewClientScreen")
            }
          />
        </View>
      )}
    </View>
  );
};

export default HeaderTopScrenn;
