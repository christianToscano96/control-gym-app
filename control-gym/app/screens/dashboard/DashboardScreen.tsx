import AttendanceChart from "@/components/ui/AttendanceChart";
import FAB from "@/components/ui/FAB";
import Header from "@/components/ui/Header";
import PeakHoursChart from "@/components/ui/PeakHoursChart";
import QuickActionsMenu from "@/components/ui/QuickActionsMenu";
import RecentCheckIns from "@/components/ui/RecentCheckIns";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { SkeletonCard } from "@/components/ui/skeletons";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import { useDashboardStatsQuery } from "@/hooks/queries/useDashboard";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../../stores/store";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { colors } = useTheme();
  const isStaff = user?.role === "empleado";

  // ─── TanStack Query ──────────────────────────────────────────
  const { data: profile } = useProfileQuery();
  const { data: stats, isLoading: loadingStats } =
    useDashboardStatsQuery(!isStaff);

  // Sync profile avatar to Zustand store
  useEffect(() => {
    if (profile?.avatar && user?.token) {
      const avatarUrl = `${API_BASE_URL}${profile.avatar}`;
      if (user.avatar !== avatarUrl) {
        setUser({ ...user, avatar: avatarUrl }, user.token);
      }
    }
  }, [profile?.avatar]);

  const handleActionPress = (action: string) => {
    if (action === "new-client") {
      router.push("/screens/clients/NewClientScreen");
    }
    if (action === "staff") {
      router.push("/screens/staff");
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
          {!isStaff && (
            <>
              <View className="flex flex-row justify-between gap-4 p-2">
                {loadingStats ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <SummaryCard
                      icon="people"
                      title="CLIENTES"
                      value={stats?.totalClients.toString() || "0"}
                      persent={stats?.clientsPercent || "0%"}
                    />
                    <SummaryCard
                      icon="fitness-center"
                      title="INGRESARON HOY"
                      value={stats?.todayCheckIns.toString() || "0"}
                      persent={stats?.checkInsPercent || "0%"}
                    />
                  </>
                )}
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
            </>
          )}
          <RecentCheckIns />
        </ScrollView>
        <>
          <QuickActionsMenu
            visible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onActionPress={handleActionPress}
          />
        </>
      </View>
      <FAB isOpen={isMenuOpen} onPress={() => setIsMenuOpen(!isMenuOpen)} />
    </SafeAreaView>
  );
}
