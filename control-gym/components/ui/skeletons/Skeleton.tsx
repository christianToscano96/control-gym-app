import React, { useEffect, useRef, useMemo } from "react";
import { Animated, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    // Cleanup: detener animación al desmontar
    return () => animation.stop();
  }, [opacity]);

  // Memoizar backgroundColor para evitar recalcular
  const backgroundColor = useMemo(
    () => (isDark ? "#2a2a2a" : "#e0e0e0"),
    [isDark],
  );

  // Memoizar estilos para evitar recrear objeto
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
    [width, height, borderRadius, backgroundColor, opacity, style],
  );

  return <Animated.View style={skeletonStyle} />;
};

// Memoizar componente para evitar re-renders innecesarios
export default React.memo(Skeleton);
