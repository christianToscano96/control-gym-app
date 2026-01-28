import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { useFocusReload } from "./useFocusReload";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonCustom from "@/components/ui/ButtonCustom";
import SearchInput from "@/components/ui/SearchInput";
import ListUSers from "./ListUSers";
import { fetchClients } from "@/api/clients";
import { useUserStore } from "@/stores/store";
import { useTheme } from "@/context/ThemeContext";

const TAB_ALL = "Todos";
const TAB_ACTIVE = "Activos";
const TAB_EXPIRED = "Inactivos";

export default function UsersScreen() {
  const [tab, setTab] = useState(TAB_ALL);
  const { primaryColor } = useTheme();
  const { user } = useUserStore();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchClients(user.token);
      setClients(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useFocusReload(loadClients);

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    let matchesTab = true;
    if (tab === TAB_ACTIVE) matchesTab = c.active;
    else if (tab === TAB_EXPIRED) matchesTab = !c.active;
    return matchesSearch && matchesTab;
  });

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
              onPress={() => router.push("/screens/NewUserScreen")}
            />
          </View>
        </View>
        <View className="mt-4 px-4">
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar usuarios..."
            onClear={() => setSearch("")}
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
            title="Inactivos"
            sm
            isActive={tab === TAB_EXPIRED}
            onPress={() => setTab(TAB_EXPIRED)}
          />
        </View>

        {loading ? (
          <Text className="text-center mt-10">Cargando clientes...</Text>
        ) : error ? (
          <Text className="text-center mt-10 text-red-500">{error}</Text>
        ) : (
          <ListUSers users={filteredClients} />
        )}
      </View>
    </SafeAreaView>
  );
}
