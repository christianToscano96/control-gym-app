import React from "react";
import { View } from "react-native";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para avatar con nombre y badge
 */
const SkeletonProfileHeader: React.FC = () => {
  return (
    <View className="flex-row items-center p-4">
      {/* Avatar */}
      <Skeleton width={60} height={60} borderRadius={30} />

      {/* Nombre y badge */}
      <View className="ml-4 flex-1">
        <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>

      {/* Icono/botón */}
      <Skeleton width={40} height={40} borderRadius={20} />
    </View>
  );
};

export default React.memo(SkeletonProfileHeader);
