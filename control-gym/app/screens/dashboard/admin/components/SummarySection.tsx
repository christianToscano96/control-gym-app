import React from "react";
import { View, Text } from "react-native";
import { RevenueCard } from "@/components/ui/RevenueCard";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  stats: any;
  loading: boolean;
}

export function SummarySection({ stats, loading }: Props) {
  const { colors } = useTheme();

  return (
    <>
      <Text
        style={{ color: colors.textSecondary }}
        className="text-xs font-bold uppercase tracking-wider px-2 mt-2 mb-1"
      >
        Resumen
      </Text>
      <View className="px-2">
        <RevenueCard
          value={`$${stats?.monthlyRevenue?.toLocaleString() || "0"}`}
          percent={stats?.revenuePercent || "0%"}
          loading={loading}
        />
      </View>

      <View className="flex flex-row justify-between gap-4 p-2">
        <SummaryCard
          icon="people"
          title="CLIENTES"
          value={loading ? "..." : stats?.totalClients.toString() || "0"}
          persent={loading ? "..." : stats?.clientsPercent || "0%"}
        />
        <SummaryCard
          icon="fitness-center"
          title="INGRESOS HOY"
          value={loading ? "..." : stats?.todayCheckIns.toString() || "0"}
          persent={loading ? "..." : stats?.checkInsPercent || "0%"}
        />
      </View>
    </>
  );
}
