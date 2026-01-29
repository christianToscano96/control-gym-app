import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Mostrar el toast con animación
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-hide después del duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      if (onHide) {
        runOnJS(onHide)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#D1FAE5",
          borderColor: "#059669",
          textColor: "#065F46",
          icon: "check-circle" as keyof typeof MaterialCommunityIcons.glyphMap,
          iconColor: "#059669",
        };
      case "error":
        return {
          backgroundColor: "#FECACA",
          borderColor: "#DC2626",
          textColor: "#991B1B",
          icon: "alert-circle" as keyof typeof MaterialCommunityIcons.glyphMap,
          iconColor: "#DC2626",
        };
      case "warning":
        return {
          backgroundColor: "#FEF3C7",
          borderColor: "#F59E0B",
          textColor: "#92400E",
          icon: "alert" as keyof typeof MaterialCommunityIcons.glyphMap,
          iconColor: "#F59E0B",
        };
      case "info":
      default:
        return {
          backgroundColor: "#DBEAFE",
          borderColor: "#3B82F6",
          textColor: "#1E3A8A",
          icon: "information" as keyof typeof MaterialCommunityIcons.glyphMap,
          iconColor: "#3B82F6",
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 60,
          left: 20,
          right: 20,
          zIndex: 9999,
          backgroundColor: config.backgroundColor,
          borderLeftWidth: 4,
          borderLeftColor: config.borderColor,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        },
        animatedStyle,
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={24}
        color={config.iconColor}
        style={{ marginRight: 12 }}
      />
      <Text
        style={{
          flex: 1,
          color: config.textColor,
          fontSize: 15,
          fontWeight: "600",
          lineHeight: 20,
        }}
        numberOfLines={3}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

export default Toast;
