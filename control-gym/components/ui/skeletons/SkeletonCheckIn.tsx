import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para RecentCheckIns
 */
const SkeletonCheckIn: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="rounded-2xl p-4 flex-row items-center mb-3 shadow-sm shadow-black/5"
    >
      {/* Avatar */}
      <Skeleton width={56} height={56} borderRadius={28} />

      {/* Nombre y membresía */}
      <View className="flex-1 ml-4">
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={13} />
      </View>

      {/* Tiempo y punto */}
      <View className="items-end justify-between h-10">
        <Skeleton width={60} height={12} />
        <Skeleton width={8} height={8} borderRadius={4} />
      </View>
    </View>
  );
};

export default React.memo(SkeletonCheckIn);
