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
        membershipType={item.membershipType}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: any) => item._id, []);

  const listHeader = useMemo(
    () => (
      <View className="flex-row items-center justify-between mb-3">
        <Text
          style={{ color: colors.textSecondary }}
          className="text-xs font-semibold uppercase tracking-wider"
        >
          {clients?.length || 0} resultados
        </Text>
      </View>
    ),
    [colors.textSecondary, clients?.length],
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
    <View className="px-4 pt-3 flex-1">
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
