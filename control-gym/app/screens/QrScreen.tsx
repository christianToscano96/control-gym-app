import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const QrScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>QrScreensss</Text>
    </View>
  );
};

export default QrScreen;
