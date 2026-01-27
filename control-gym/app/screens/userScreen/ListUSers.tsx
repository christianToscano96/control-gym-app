import { ScrollView, Text, View } from "react-native";
import ItemUser from "./ItemUser";

interface ListUSersProps {
  users?: any[];
}
const ListUSers = ({ users }: ListUSersProps) => {
  return (
    <View className=" p-5 mt-5  flex-1">
      <View className="flex flex-row justify-between mb-4">
        <Text className="text-lg text-gray-400 font-bold">TOTAL: 1.200</Text>
        <Text className="text-lg text-gray-400 font-bold">ULTIMOS 30 DIAS</Text>
      </View>
      <View className="">
        <ScrollView showsVerticalScrollIndicator={false}>
          {users?.map((user, index) => (
            <ItemUser
              key={index}
              name={user.name}
              status={user.status}
              avatarUri={user.avatarUri}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default ListUSers;
