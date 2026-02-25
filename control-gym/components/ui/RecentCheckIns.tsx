import React, { useCallback, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import Avatar from "./Avatar";
import { useTheme } from "@/context/ThemeContext";
import { useRecentCheckInsQuery } from "@/hooks/queries/useDashboard";
import { RecentCheckIn } from "@/api/dashboard";

const membershipLabels: Record<string, string> = {
  basico: "Básico",
  pro: "Pro",
  proplus: "Pro+",
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
}

const RecentCheckIns: React.FC = () => {
  const { colors } = useTheme();
  const { data: checkIns = [], isLoading } = useRecentCheckInsQuery();

  const renderItem = useCallback(
    ({ item }: { item: RecentCheckIn }) => (
      <View
        style={{ backgroundColor: colors.card }}
        className="rounded-2xl p-4 flex-row items-center mb-3 shadow-sm shadow-black/5"
      >
        <Avatar size="md" name={item.clientName} />

        <View className="flex-1 ml-4">
          <Text
            style={{ color: colors.text }}
            className="text-[16px] font-bold mb-0.5"
            numberOfLines={1}
          >
            {item.clientName}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-[13px]">
            Membresía:{" "}
            <Text
              style={{ color: colors.textSecondary }}
              className="font-medium"
            >
              {membershipLabels[item.membershipType] || item.membershipType}
            </Text>
          </Text>
        </View>

        <View className="items-end justify-between h-10">
          <Text
            style={{ color: colors.text }}
            className="text-[12px] font-bold"
          >
            {formatTimeAgo(item.date)}
          </Text>
          <View className="w-2 h-2 rounded-full bg-[#66BB6A] mt-1.5" />
        </View>
      </View>
    ),
    [colors.card, colors.text, colors.textSecondary],
  );

  const keyExtractor = useCallback((item: RecentCheckIn) => item._id, []);

  const listHeader = useMemo(
    () => (
      <View className="flex-row justify-between items-center mb-4">
        <Text
          style={{ color: colors.text }}
          className="text-[20px] font-extrabold"
        >
          Check-ins Recientes
        </Text>
      </View>
    ),
    [colors.text],
  );

  const listEmpty = useMemo(
    () =>
      isLoading ? (
        <ActivityIndicator color={colors.textSecondary} className="py-8" />
      ) : (
        <View className="items-center py-8">
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Sin check-ins recientes
          </Text>
        </View>
      ),
    [isLoading, colors.textSecondary],
  );

  return (
    <View className="my-5 px-1">
      <FlatList
        data={checkIns}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        scrollEnabled={false}
      />
    </View>
  );
};

export default RecentCheckIns;
