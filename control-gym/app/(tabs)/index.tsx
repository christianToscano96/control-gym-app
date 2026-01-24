import Header from "@/components/ui/Header";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore, useMembershipStore } from "../../stores/store";
import { SummaryCard } from "@/components/ui/SummaryCard";
export default function HomeScreen() {
  const user = useUserStore((state) => state.user);
  const hasActiveMembership = useMembershipStore(
    (state) => state.hasActiveMembership,
  );

  console.log({ user, hasActiveMembership });
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-4 mt-4">
        <Header username={user?.name} />
        <ScrollView className="mt-8">
          <View className="flex flex-row justify-between gap-5">
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
