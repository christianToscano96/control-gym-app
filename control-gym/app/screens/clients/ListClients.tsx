import { FlatList, Text, View } from "react-native";
import React, { useCallback, useMemo } from "react";
import ItemClient from "./ItemClient";
import { useTheme } from "@/context/ThemeContext";
import { calculateExpirationDate } from "@/utils/membershipUtils";

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
      />
    );
  }, []);

  const keyExtractor = useCallback((item: any) => item._id, []);

  const listHeader = useMemo(
    () => (
      <View className="flex flex-row justify-between mb-4">
        <Text
          style={{ color: colors.textSecondary }}
          className="text-lg font-bold"
        >
          TOTAL: {clients?.length || 0}
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-lg font-bold"
        >
          ULTIMOS 30 DIAS
        </Text>
      </View>
    ),
    [colors.textSecondary, clients?.length],
  );

  return (
    <View className=" p-5 mt-5  flex-1">
      <FlatList
        data={clients || []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
      />
    </View>
  );
};

export default ListClients;
