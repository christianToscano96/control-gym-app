import { ScrollView, Text, View } from "react-native";
import ItemClient from "./ItemClient";
import { useTheme } from "@/context/ThemeContext";

interface ListClientsProps {
  clients?: any[];
}
const ListClients = ({ clients }: ListClientsProps) => {
  const { colors } = useTheme();
  console.log(clients);
  return (
    <View className=" p-5 mt-5  flex-1">
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
      <View className="">
        <ScrollView showsVerticalScrollIndicator={false}>
          {clients?.map((client, index) => (
            <ItemClient
              key={client._id}
              name={client.firstName + " " + client.lastName}
              status={client.active ? "Activo" : "Inactivo"}
              avatarUri={
                client.avatarUri ||
                "https://ui-avatars.com/api/?name=+&background=cccccc&color=ffffff&size=128"
              }
              clientId={client._id}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default ListClients;
