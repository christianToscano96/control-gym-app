import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <SafeAreaView className="flex flex-1">
      <View className="bg-white">
        <Text>QR Acess Screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default index;
