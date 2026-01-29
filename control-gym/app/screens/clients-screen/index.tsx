import { fetchClients } from "@/api/clients";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import SearchInput from "@/components/ui/SearchInput";
import { useUserStore } from "@/stores/store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListClients from "./ListClients";
import { useFocusReload } from "./useFocusReload";

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
    [],
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", padding: 6 }}>
      <HeaderTopScrenn title="Usuarios" isAddClient />
      <View className="flex-1">
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
              width="sm"
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
