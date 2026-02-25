import React, { useEffect, useRef, useMemo } from "react";
import { Animated, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface SkeletonWaveProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  delay?: number;
}

/**
 * Skeleton con animación de ola suave
 * Transición más fluida que el pulso estándar
 */
const SkeletonWave: React.FC<SkeletonWaveProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
  delay = 0,
}) => {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, delay]);

  const backgroundColor = useMemo(
    () => (isDark ? "#2a2a2a" : "#e0e0e0"),
    [isDark]
  );

  const skeletonStyle = useMemo(
    () => [
      {
        width: width as any,
        height: height as any,
        borderRadius,
        backgroundColor,
        opacity,
      },
      style,
    ],
    [width, height, borderRadius, backgroundColor, opacity, style]
  );

  return <Animated.View style={skeletonStyle} />;
};

export default React.memo(SkeletonWave);
