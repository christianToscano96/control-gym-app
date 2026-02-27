import { FlatList, Text, View } from "react-native";
import React, { useCallback, useMemo } from "react";
import ItemClient from "./ItemClient";
import { useTheme } from "@/context/ThemeContext";
import { calculateExpirationDate } from "@/utils/membershipUtils";
import EmptyState from "@/components/ui/EmptyState";

interface ListClientsProps {
  clients?: any[];
}
const ListClients = ({ clients }: ListClientsProps) => {
  const { colors } = useTheme();

  const activeCount = useMemo(
    () => clients?.filter((c) => !!c.isActive).length || 0,
    [clients],
  );
  const inactiveCount = useMemo(
    () => (clients?.length || 0) - activeCount,
    [clients?.length, activeCount],
  );

  const renderItem = useCallback(({ item }: { item: any }) => {
    const expirationDate = calculateExpirationDate(
      item.startDate,
      item.createdAt,
      item.selected_period
    );
    const daysLeft = expirationDate
      ? Math.ceil(
          (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : undefined;

    return (
      <ItemClient
        name={item.firstName + " " + item.lastName}
        isActive={!!item.isActive}
        daysLeft={daysLeft}
        clientId={item._id}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: any) => item._id, []);

  const listHeader = useMemo(
    () => (
      <View className="flex-row items-center justify-between mb-4">
        <View
          className="flex-row items-center rounded-full px-3 py-1.5"
          style={{ backgroundColor: colors.border + "40" }}
        >
          <Text
            style={{ color: colors.text }}
            className="text-sm font-bold"
          >
            {clients?.length || 0}
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm ml-1"
          >
            total
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className="flex-row items-center rounded-full px-3 py-1.5"
            style={{ backgroundColor: "#D1FAE5" }}
          >
            <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: "#059669" }} />
            <Text style={{ color: "#059669" }} className="text-sm font-semibold">
              {activeCount}
            </Text>
            <Text style={{ color: "#059669" }} className="text-sm ml-1 opacity-80">
              activos
            </Text>
          </View>

          <View
            className="flex-row items-center rounded-full px-3 py-1.5"
            style={{ backgroundColor: "#FECACA" }}
          >
            <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: "#DC2626" }} />
            <Text style={{ color: "#DC2626" }} className="text-sm font-semibold">
              {inactiveCount}
            </Text>
            <Text style={{ color: "#DC2626" }} className="text-sm ml-1 opacity-80">
              inactivos
            </Text>
          </View>
        </View>
      </View>
    ),
    [colors.text, colors.textSecondary, colors.border, clients?.length, activeCount, inactiveCount],
  );

  const emptyComponent = useMemo(
    () => (
      <EmptyState
        icon="people"
        title="Sin usuarios"
        description="No se encontraron usuarios con los filtros seleccionados"
      />
    ),
    [],
  );

  return (
    <View className="px-5 pt-5 flex-1">
      <FlatList
        data={clients || []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
      />
    </View>
  );
};

export default ListClients;
