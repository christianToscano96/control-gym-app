import React from "react";
import { ViewStyle, Pressable } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface FABProps {
  onPress?: () => void;
  style?: ViewStyle;
  isOpen?: boolean;
}

const FAB = ({ onPress, style, isOpen = false }: FABProps) => {
  const { primaryColor } = useTheme();
  const openBg = isOpen ? "#90EE90" : primaryColor;

  // Animation values
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    rotate.value = withTiming(isOpen ? 45 : 0, { duration: 300 });
  }, [isOpen, rotate]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: isOpen ? 1.1 : 1 }],
  }));

  return (
    <Animated.View className="absolute bottom-7 right-6 z-10" style={style}>
      <Animated.View
        className="w-16 h-16 rounded-full justify-center items-center shadow-lg"
        style={[
          { backgroundColor: openBg, shadowColor: openBg },
          animatedButtonStyle,
        ]}
      >
        <Animated.View style={animatedIconStyle}>
          <Ionicons name="add" size={32} color="#1A1A1A" />
        </Animated.View>
        <AnimatedPressable
          className="absolute w-16 h-16 rounded-full top-0 left-0"
          onPressIn={() => {
            scale.value = withSpring(0.93);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          onPress={onPress}
          style={{ backgroundColor: "transparent" }}
        />
      </Animated.View>
    </Animated.View>
  );
};

// AnimatedPressable helper
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default FAB;
