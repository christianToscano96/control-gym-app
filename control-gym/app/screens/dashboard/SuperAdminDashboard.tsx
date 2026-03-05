import React from "react";
import { View, ScrollView, RefreshControl, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import Header from "@/components/ui/Header";
import SearchInput from "@/components/ui/SearchInput";
import { useSuperAdminDashboard } from "./hooks/useSuperAdminDashboard";
import { RevenueCard } from "./components/RevenueCard";
import { StatCard } from "./components/StatCard";
import { PlanDistribution } from "./components/PlanDistribution";
import { FilterChips } from "./components/FilterChips";
import { GymAdminList } from "./components/GymAdminList";

export default function SuperAdminDashboard() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const { colors, primaryColor } = useTheme();

  const {
    refreshing,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    isLoading,
    isError,
    error,
    refetch,
    onRefresh,
    filteredAdmins,
    pendingAdmins,
    summary,
    filterOptions,
  } = useSuperAdminDashboard();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <View className="px-4 mt-4">
        <Header username={user?.name} avatarUrl={user?.avatar} />
        <ScrollView
          className="my-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
        >
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-wider px-2 mt-2 mb-1"
          >
            Panel Super Admin
          </Text>

          <View
            style={{
              backgroundColor: "#F59E0B15",
              borderColor: "#F59E0B50",
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialIcons name="pending-actions" size={20} color="#F59E0B" />
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>
                  Pendientes de aprobación
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFilterStatus("pending")}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#F59E0B", fontWeight: "700", fontSize: 12 }}>
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
              {summary?.pendingGyms ?? 0} gimnasios esperando revisión
            </Text>
            {pendingAdmins.slice(0, 3).map((admin) => (
              <TouchableOpacity
                key={admin._id}
                onPress={() => {
                  if (admin.gym) {
                    router.push({
                      pathname: "/screens/superadmin/gym-detail",
                      params: { gymId: admin.gym._id },
                    } as any);
                  }
                }}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  marginTop: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                    {admin.gym?.name || "Sin gimnasio"}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Admin: {admin.name}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: "#F59E0B", fontSize: 11, fontWeight: "700" }}>
                    Revisar
                  </Text>
                  <MaterialIcons name="chevron-right" size={18} color="#F59E0B" />
                </View>
              </TouchableOpacity>
            ))}
            {pendingAdmins.length === 0 && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 10,
                  marginTop: 4,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  No hay solicitudes pendientes por ahora.
                </Text>
              </View>
            )}
          </View>

          <RevenueCard
            isLoading={isLoading}
            totalRevenue={summary?.totalGymRevenue ?? 0}
            platformRevenue={summary?.totalPlatformRevenue ?? 0}
          />

          <View className="flex-row gap-3 px-1 my-2">
            <StatCard
              icon="store"
              label="GIMNASIOS"
              value={isLoading ? "..." : String(summary?.totalGyms ?? 0)}
              subtitle={`${summary?.activeGyms ?? 0} activos`}
              accentColor={primaryColor}
            />
            <StatCard
              icon="people"
              label="CLIENTES"
              value={isLoading ? "..." : String(summary?.totalClients ?? 0)}
              subtitle={`${summary?.totalGyms ? Math.round(summary.totalClients / summary.totalGyms) : 0} prom/gym`}
              accentColor="#6366F1"
            />
          </View>

          <PlanDistribution
            isLoading={isLoading}
            planDistribution={summary?.planDistribution}
          />

          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar gimnasio o admin..."
            onClear={() => setSearchQuery("")}
          />

          <FilterChips
            filterStatus={filterStatus}
            filterOptions={filterOptions}
            onFilterChange={setFilterStatus}
          />

          <GymAdminList
            isLoading={isLoading}
            isError={isError}
            error={error}
            filteredAdmins={filteredAdmins}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onRetry={() => refetch()}
            onAdminPress={(admin) => {
              if (admin.gym) {
                router.push({
                  pathname: "/screens/superadmin/gym-detail",
                  params: { gymId: admin.gym._id },
                } as any);
              }
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
