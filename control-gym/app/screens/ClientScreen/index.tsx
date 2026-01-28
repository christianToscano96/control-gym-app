import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusReload } from "./useFocusReload";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonCustom from "@/components/ui/ButtonCustom";
import SearchInput from "@/components/ui/SearchInput";
import { fetchClients } from "@/api/clients";
import { useUserStore } from "@/stores/store";
import { useTheme } from "@/context/ThemeContext";
import ListClients from "./ListClients";

const TAB_ALL = "Todos";
const TAB_ACTIVE = "Activos";
const TAB_EXPIRED = "Inactivos";

interface Client {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  status?: string;
  active?: boolean;
}

export default function ClientsScreen() {
  const [tab, setTab] = useState(TAB_ALL);
  const { primaryColor } = useTheme();
  const { user } = useUserStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useFocusReload(loadClients);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const tabOptions = useMemo(
    () => [
      { key: TAB_ALL, label: "Todos" },
      { key: TAB_ACTIVE, label: "Activos" },
      { key: TAB_EXPIRED, label: "Inactivos" },
    ],
    []
  );

  const filteredClients = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return clients.filter((c) => {
      const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      const matchesSearch = q ? fullName.includes(q) : true;
      let matchesTab = true;
      if (tab === TAB_ACTIVE) matchesTab = !!c.active;
      else if (tab === TAB_EXPIRED) matchesTab = !c.active;
      return matchesSearch && matchesTab;
    });
  }, [clients, debouncedSearch, tab]);

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
              onPress={() => router.push("/screens/NewClientScreen")}
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
          {tabOptions.map((t) => (
            <ButtonCustom
              key={t.key}
              tertiary
              title={t.label}
              sm
              isActive={tab === t.key}
              onPress={() => setTab(t.key)}
            />
          ))}
        </View>

        {loading ? (
          <Text className="text-center mt-10">Cargando clientes...</Text>
        ) : error ? (
          <Text className="text-center mt-10 text-red-500">{error}</Text>
        ) : (
          <ListClients clients={filteredClients} />
        )}
      </View>
    </SafeAreaView>
  );
}
