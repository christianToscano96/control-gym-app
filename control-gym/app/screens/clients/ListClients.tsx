import { FlatList, Text, View } from "react-native";
import ItemClient from "./ItemClient";
import { useTheme } from "@/context/ThemeContext";

interface ListClientsProps {
  clients?: any[];
}
const ListClients = ({ clients }: ListClientsProps) => {
  const { colors } = useTheme();
  console.log(clients);

  const renderItem = ({ item }: { item: any }) => (
    <ItemClient
      name={item.firstName + " " + item.lastName}
      status={item.active ? "Activo" : "Inactivo"}
      avatarUri={
        item.avatarUri ||
        "https://ui-avatars.com/api/?name=+&background=cccccc&color=ffffff&size=128"
      }
      clientId={item._id}
    />
  );

  const ListHeaderComponent = () => (
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
  );

  return (
    <View className=" p-5 mt-5  flex-1">
      <FlatList
        data={clients || []}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
};

export default ListClients;
