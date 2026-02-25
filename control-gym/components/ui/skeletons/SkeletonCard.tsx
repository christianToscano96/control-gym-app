import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para SummaryCard del dashboard
 */
const SkeletonCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="flex-1 rounded-2xl p-5 my-2 shadow-sm shadow-black/5 mb-1"
    >
      {/* Icon y Badge superior */}
      <View className="flex flex-row items-center justify-between mb-2">
        <Skeleton width={24} height={24} borderRadius={4} />
        <Skeleton width={50} height={24} borderRadius={8} />
      </View>

      {/* Título */}
      <View className="mb-2">
        <Skeleton width="80%" height={18} />
      </View>

      {/* Valor */}
      <Skeleton width="50%" height={32} />
    </View>
  );
};

export default React.memo(SkeletonCard);
