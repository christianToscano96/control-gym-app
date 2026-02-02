import AttendanceChart from "@/components/ui/AttendanceChart";
import FAB from "@/components/ui/FAB";
import Header from "@/components/ui/Header";
import PeakHoursChart from "@/components/ui/PeakHoursChart";
import QuickActionsMenu from "@/components/ui/QuickActionsMenu";
import RecentCheckIns from "@/components/ui/RecentCheckIns";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../../stores/store";
import { getProfile } from "@/api/user";
import { getDashboardStats, DashboardStats } from "@/api/dashboard";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const { colors } = useTheme();

  const loadUserProfile = useCallback(async () => {
    if (!user?.token) return;

    try {
      const profile = await getProfile(user.token);
      if (profile.avatar) {
        setUser(
          {
            ...user,
            avatar: `${API_BASE_URL}${profile.avatar}`,
          },
          user.token,
        );
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  }, [user?.token, setUser]);

  const loadStats = useCallback(async () => {
    if (!user?.token) return;

    try {
      const dashboardStats = await getDashboardStats(user.token);
      setStats(dashboardStats);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [user?.token]);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadStats();
    }, [loadUserProfile, loadStats]),
  );

  const handleActionPress = (action: string) => {
    if (action === "Nuevo Cliente") {
      router.push("/screens/clients-screen/NewClientScreen");
    }
    setIsMenuOpen(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <View className="px-4 mt-4">
        <Header username={user?.name} avatarUrl={user?.avatar} />
        <ScrollView className="my-4" showsVerticalScrollIndicator={false}>
          <View className="flex flex-row justify-between gap-4 p-2">
            <SummaryCard
              icon="people"
              title="CLIENTES"
              value={
                loadingStats ? "..." : stats?.totalClients.toString() || "0"
              }
              persent={loadingStats ? "..." : stats?.clientsPercent || "0%"}
            />
            <SummaryCard
              icon="fitness-center"
              title="INGRESARON HOY"
              value={
                loadingStats ? "..." : stats?.todayCheckIns.toString() || "0"
              }
              persent={loadingStats ? "..." : stats?.checkInsPercent || "0%"}
            />
          </View>
          <AttendanceChart
            data={[
              { value: 50, label: "MON" },
              { value: 80, label: "TUE" },
              { value: 40, label: "WED" },
              { value: 95, label: "THU" },
              { value: 85, label: "FRI" },
              { value: 35, label: "SAT" },
              { value: 75, label: "SUN" },
            ]}
          />
          <PeakHoursChart
            data={[
              { value: 60, label: "6AM" },
              { value: 70, label: "9AM" },
              { value: 80, label: "12PM" },
              { value: 90, label: "3PM" },
              { value: 100, label: "6PM" },
              { value: 70, label: "9PM" },
            ]}
          />
          <RecentCheckIns />
        </ScrollView>
        <QuickActionsMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onActionPress={handleActionPress}
        />
        <FAB isOpen={isMenuOpen} onPress={() => setIsMenuOpen(!isMenuOpen)} />
      </View>
    </SafeAreaView>
  );
}
