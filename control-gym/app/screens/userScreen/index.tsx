import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonCustom from "@/components/ui/ButtonCustom";
import SearchInput from "@/components/ui/SearchInput";
import ListUSers from "./ListUSers";
import { useTheme } from "@/context/ThemeContext";

// Datos ficticios de usuarios
const fakeUsers = [
  {
    avatarUri: "https://i.pravatar.cc/300?img=1",
    name: "Juan Pérez",
    status: "Activo",
  },
];

const TAB_ALL = "Todos";
const TAB_ACTIVE = "Activos";
const TAB_EXPIRED = "Expirados";

export default function UsersScreen() {
  const [tab, setTab] = useState(TAB_ALL);
  const { primaryColor } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", padding: 5 }}>
      <View className="flex-1">
        <View className="flex flex-row items-center mb-5 gap-4 border-b-2 pb-2 border-gray-100 pr-4">
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#686868"
            onPress={() => router.back()}
          />
          <Text style={{ fontSize: 24, fontWeight: "bold", flex: 1 }}>
            Usuarios
          </Text>
          <View
            className="w-9 h-9 rounded-full justify-center items-center"
            style={{ backgroundColor: primaryColor }}
          >
            <MaterialIcons
              name="add"
              size={24}
              color="white"
              onPress={() => router.push("/NewUserScreen")}
            />
          </View>
        </View>
        <View className="mt-4 px-4">
          <SearchInput
            value={""}
            onChangeText={() => {}}
            placeholder="Buscar usuarios..."
            onClear={() => {}}
          />
        </View>

        <View className="mt-3 px-4 flex flex-row flex-wrap justify-start space-x-2 gap-2 ">
          <ButtonCustom
            tertiary
            title="Todos"
            sm
            isActive={tab === TAB_ALL}
            onPress={() => setTab(TAB_ALL)}
          />
          <ButtonCustom
            tertiary
            title="Activos"
            sm
            isActive={tab === TAB_ACTIVE}
            onPress={() => setTab(TAB_ACTIVE)}
          />
          <ButtonCustom
            tertiary
            title="Expirados"
            sm
            isActive={tab === TAB_EXPIRED}
            onPress={() => setTab(TAB_EXPIRED)}
          />
        </View>

        <ListUSers users={fakeUsers} />
      </View>
    </SafeAreaView>
  );
}
