import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para pantalla de escaneo QR
 */
const SkeletonQRScanner: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View className="flex-1">
      {/* Área de cámara */}
      <View className="flex-1 items-center justify-center">
        <Skeleton width={300} height={300} borderRadius={20} />
        <Skeleton
          width={200}
          height={16}
          style={{ marginTop: 20, marginBottom: 8 }}
        />
        <Skeleton width={160} height={14} />
      </View>

      {/* Info cards */}
      <View className="p-5">
        <View
          style={{ backgroundColor: colors.card }}
          className="rounded-2xl p-4 mb-3"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Skeleton width="40%" height={18} />
            <Skeleton width={60} height={24} borderRadius={12} />
          </View>
          <View className="flex-row items-center">
            <Skeleton width={48} height={48} borderRadius={24} />
            <View className="ml-3 flex-1">
              <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
              <Skeleton width="50%" height={14} />
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="flex-row gap-3">
          <Skeleton width="48%" height={48} borderRadius={12} />
          <Skeleton width="48%" height={48} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(SkeletonQRScanner);
