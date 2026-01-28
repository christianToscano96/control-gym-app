import { ScrollView, Text, View } from "react-native";
import ItemUser from "./ItemUser";

interface ListUSersProps {
  users?: any[];
}
const ListUSers = ({ users }: ListUSersProps) => {
  console.log(users);
  return (
    <View className=" p-5 mt-5  flex-1">
      <View className="flex flex-row justify-between mb-4">
        <Text className="text-lg text-gray-400 font-bold">
          TOTAL: {users?.length || 0}
        </Text>
        <Text className="text-lg text-gray-400 font-bold">ULTIMOS 30 DIAS</Text>
      </View>
      <View className="">
        <ScrollView showsVerticalScrollIndicator={false}>
          {users?.map((user, index) => (
            <ItemUser
              key={user._id}
              name={user.firstName + " " + user.lastName}
              status={user.status}
              avatarUri={
                user.avatarUri ||
                "https://ui-avatars.com/api/?name=+&background=cccccc&color=ffffff&size=128"
              }
              userId={user._id}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default ListUSers;
