import { ScrollView, Text, View } from "react-native";
import ItemClient from "./ItemClient";

interface ListClientsProps {
  clients?: any[];
}
const ListClients = ({ clients }: ListClientsProps) => {
  console.log(clients);
  return (
    <View className=" p-5 mt-5  flex-1">
      <View className="flex flex-row justify-between mb-4">
        <Text className="text-lg text-gray-400 font-bold">
          TOTAL: {clients?.length || 0}
        </Text>
        <Text className="text-lg text-gray-400 font-bold">ULTIMOS 30 DIAS</Text>
      </View>
      <View className="">
        <ScrollView showsVerticalScrollIndicator={false}>
          {clients?.map((client, index) => (
            <ItemClient
              key={client._id}
              name={client.firstName + " " + client.lastName}
              status={client.status}
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
