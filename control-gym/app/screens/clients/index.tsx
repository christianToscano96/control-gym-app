import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import SearchInput from "@/components/ui/SearchInput";
import { useTheme } from "@/context/ThemeContext";
import { useClientsQuery } from "@/hooks/queries/useClients";
import { useStaffQuery } from "@/hooks/queries/useStaff";
import { useUserStore } from "@/stores/store";
import React, { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
  const { colors, primaryColor, isDark } = useTheme();
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

  // ─── Counts ────────────────────────────────────────────────────
  const activeCount = useMemo(
    () => clients.filter((c: Client) => !!c.isActive).length,
    [clients],
  );
  const inactiveCount = useMemo(
    () => clients.length - activeCount,
    [clients.length, activeCount],
  );

  const tabOptions = useMemo(() => {
    const baseTabs = [
      { key: TAB_ALL, label: "Todos", count: clients.length },
      { key: TAB_ACTIVE, label: "Activos", count: activeCount },
      { key: TAB_EXPIRED, label: "Inactivos", count: inactiveCount },
    ];

    if (isAdmin) {
      baseTabs.push({ key: TAB_STAFF, label: "Staff", count: staff.length });
    }

    return baseTabs;
  }, [isAdmin, clients.length, activeCount, inactiveCount, staff.length]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-4 pt-1">
        <HeaderTopScrenn title="Usuarios" isAddClient />
      </View>

      <View className="flex-1">
        {/* Search */}
        <View className="px-4">
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar usuarios..."
            onClear={() => setSearch("")}
          />
        </View>

        {/* Tabs */}
        <View className="px-4 mb-2">
          <View className="flex-row gap-2">
            {tabOptions.map((t) => {
              const isActive = tab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isActive
                      ? primaryColor
                      : isDark
                        ? colors.card
                        : colors.border + "50",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#fff" : colors.textSecondary,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {t.label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.25)"
                        : isDark
                          ? colors.border + "60"
                          : colors.border + "90",
                      borderRadius: 8,
                      minWidth: 22,
                      height: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#fff" : colors.textSecondary,
                        fontWeight: "700",
                        fontSize: 11,
                      }}
                    >
                      {t.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text style={{ color: colors.textSecondary }} className="text-base">
              Cargando clientes...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text
              style={{ color: colors.error }}
              className="text-base text-center"
            >
              {error}
            </Text>
          </View>
        ) : (
          <ListClients clients={filteredClients} />
        )}
      </View>
    </SafeAreaView>
  );
}
