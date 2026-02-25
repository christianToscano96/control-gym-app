import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para ItemClient en la lista de clientes
 */
const SkeletonClientItem: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      className="w-full h-20 rounded-2xl mb-3 border flex-row items-center p-3"
    >
      {/* Avatar */}
      <Skeleton width={48} height={48} borderRadius={24} />

      {/* Nombre */}
      <View className="flex-1 ml-4">
        <Skeleton width="70%" height={18} />
      </View>

      {/* Badge y chevron */}
      <View className="flex-row items-center gap-2">
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={28} height={28} borderRadius={4} />
      </View>
    </View>
  );
};

export default React.memo(SkeletonClientItem);
