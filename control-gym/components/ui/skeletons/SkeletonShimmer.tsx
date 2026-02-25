import React, { useEffect, useRef, useMemo } from "react";
import { Animated, ViewStyle, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonShimmerProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton con efecto shimmer (brillo deslizante) - estilo moderno
 * Similar a Facebook, LinkedIn
 */
const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { isDark } = useTheme();
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [translateX]);

  const backgroundColor = useMemo(
    () => (isDark ? "#2a2a2a" : "#e0e0e0"),
    [isDark]
  );

  const shimmerColors = useMemo(
    () =>
      isDark
        ? ["#2a2a2a", "#3a3a3a", "#2a2a2a"] as const
        : ["#e0e0e0", "#f0f0f0", "#e0e0e0"] as const,
    [isDark]
  );

  const containerStyle = useMemo(
    () => ({
      width: width as any,
      height: height as any,
      borderRadius,
      backgroundColor,
      overflow: "hidden" as const,
    }),
    [width, height, borderRadius, backgroundColor]
  );

  return (
    <View style={[containerStyle, style]}>
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: [-1, 1],
                outputRange: [-(width as number), width as number],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

export default React.memo(SkeletonShimmer);
