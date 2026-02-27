import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import SearchInput from "@/components/ui/SearchInput";
import { useTheme } from "@/context/ThemeContext";
import { useClientsQuery } from "@/hooks/queries/useClients";
import { useStaffQuery } from "@/hooks/queries/useStaff";
import { useUserStore } from "@/stores/store";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListClients from "./ListClients";

const TAB_ALL = "Todos";
const TAB_ACTIVE = "Activos";
const TAB_EXPIRED = "Inactivos";
const TAB_STAFF = "Staff";

interface Client {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  status?: string;
  isActive?: boolean;
}

export default function ClientsScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState(TAB_ALL);
  const { user } = useUserStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // ─── TanStack Query ────────────────────────────────────────────
  const {
    data: clients = [],
    isLoading: loadingClients,
    error: clientsError,
  } = useClientsQuery();

  const { data: staffData } = useStaffQuery(isAdmin);

  const staff: Client[] = useMemo(() => {
    if (!staffData?.staff) return [];
    return staffData.staff.map((s: any) => ({
      _id: s._id,
      firstName: s.name,
      lastName: "",
      avatarUri: s.avatar,
      status: s.role === "empleado" ? "Staff" : "Trainer",
      isActive: s.active,
    }));
  }, [staffData]);

  // ─── Debounced search ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const tabOptions = useMemo(() => {
    const baseTabs = [
      { key: TAB_ALL, label: "Todos" },
      { key: TAB_ACTIVE, label: "Activos" },
      { key: TAB_EXPIRED, label: "Inactivos" },
    ];

    if (isAdmin) {
      baseTabs.push({ key: TAB_STAFF, label: "Staff" });
    }

    return baseTabs;
  }, [isAdmin]);

  const filteredClients = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const sourceData = tab === TAB_STAFF ? staff : clients;

    return sourceData.filter((c: Client) => {
      const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      const matchesSearch = q ? fullName.includes(q) : true;
      let matchesTab = true;

      if (tab === TAB_STAFF) {
        matchesTab = true;
      } else if (tab === TAB_ACTIVE) {
        matchesTab = !!c.isActive;
      } else if (tab === TAB_EXPIRED) {
        matchesTab = !c.isActive;
      }

      return matchesSearch && matchesTab;
    });
  }, [clients, staff, debouncedSearch, tab]);

  const loading = loadingClients;
  const error = clientsError?.message || "";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, padding: 6 }}
    >
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
          <Text style={{ color: colors.text }} className="text-center mt-10">
            Cargando clientes...
          </Text>
        ) : error ? (
          <Text style={{ color: colors.error }} className="text-center mt-10">
            {error}
          </Text>
        ) : (
          <ListClients clients={filteredClients} />
        )}
      </View>
    </SafeAreaView>
  );
}
