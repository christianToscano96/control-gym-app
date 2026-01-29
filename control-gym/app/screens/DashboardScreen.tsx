import AttendanceChart from "@/components/ui/AttendanceChart";
import FAB from "@/components/ui/FAB";
import Header from "@/components/ui/Header";
import PeakHoursChart from "@/components/ui/PeakHoursChart";
import QuickActionsMenu from "@/components/ui/QuickActionsMenu";
import RecentCheckIns from "@/components/ui/RecentCheckIns";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMembershipStore, useUserStore } from "../../stores/store";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const hasActiveMembership = useMembershipStore(
    (state) => state.hasActiveMembership,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleActionPress = (action: string) => {
    if (action === "Nuevo Cliente") {
      router.push("/screens/clients-screen/NewClientScreen");
    }
    setIsMenuOpen(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-slate-50">
      <View className="px-4 mt-4">
        <Header username={user?.name} />
        <ScrollView className="my-4" showsVerticalScrollIndicator={false}>
          <View className="flex flex-row justify-between gap-4 p-2">
            <SummaryCard
              icon="people"
              title="CLIENTES"
              value="1500"
              persent="8%"
            />
            <SummaryCard
              icon="fitness-center"
              title="INGRESOS DEL DIA"
              value="75"
              persent="12%"
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
