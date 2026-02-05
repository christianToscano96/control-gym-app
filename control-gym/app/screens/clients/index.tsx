import { fetchClients } from "@/api/clients";
import { fetchStaff } from "@/api/staff";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import SearchInput from "@/components/ui/SearchInput";
import { useUserStore } from "@/stores/store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListClients from "./ListClients";
import { useFocusReload } from "./useFocusReload";
import { useTheme } from "@/context/ThemeContext";

const TAB_ALL = "Todos";
const TAB_ACTIVE = "Activos";
const TAB_EXPIRED = "Inactivos";
const TAB_STAFF = "Staff"; // Nueva pestaña para staff

interface Client {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  status?: string;
  active?: boolean;
}

export default function ClientsScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState(TAB_ALL);
  const { user } = useUserStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const loadClients = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchClients(user.token);
      setClients(data);

      // Cargar staff solo si es admin
      if (isAdmin) {
        try {
          const staffData = await fetchStaff(user.token);
          // Mapear staff a formato de cliente para reutilizar componente
          const mappedStaff = staffData.staff.map((s: any) => ({
            _id: s._id,
            firstName: s.name,
            lastName: "",
            avatarUri: s.avatar,
            status: s.role === "empleado" ? "Staff" : "Trainer",
            active: s.active,
          }));
          setStaff(mappedStaff);
        } catch (staffErr) {
          console.error("Error al cargar staff:", staffErr);
        }
      }
    } catch (err: any) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useFocusReload(loadClients);

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

    // Agregar tab de staff solo para admin/superadmin
    if (isAdmin) {
      baseTabs.push({ key: TAB_STAFF, label: "Staff" });
    }

    return baseTabs;
  }, [isAdmin]);

  const filteredClients = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    // Si la pestaña es Staff, filtrar del array de staff
    const sourceData = tab === TAB_STAFF ? staff : clients;

    return sourceData.filter((c) => {
      const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      const matchesSearch = q ? fullName.includes(q) : true;
      let matchesTab = true;

      // No aplicar filtros de activo/inactivo si estamos en la pestaña Staff
      if (tab === TAB_STAFF) {
        matchesTab = true; // Mostrar todo el staff
      } else if (tab === TAB_ACTIVE) {
        matchesTab = !!c.active;
      } else if (tab === TAB_EXPIRED) {
        matchesTab = !c.active;
      }

      return matchesSearch && matchesTab;
    });
  }, [clients, staff, debouncedSearch, tab]);

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
