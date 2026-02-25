import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para la pantalla de detalles del cliente
 */
const SkeletonClientDetail: React.FC = () => {
  const { colors } = useTheme();

  // Memoizar arrays para evitar recrear en cada render
  const infoRows = useMemo(() => [1, 2, 3, 4], []);
  const paymentRows = useMemo(() => [1, 2, 3], []);

  return (
    <View className="flex-1 p-5">
      {/* Header con avatar */}
      <View className="items-center mb-6">
        <Skeleton width={120} height={120} borderRadius={60} />
        <View className="items-center mt-4">
          <Skeleton width={200} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={80} height={20} />
        </View>
      </View>

      {/* Stats cards */}
      <View className="flex-row gap-2 mb-6">
        <View
          style={{ backgroundColor: colors.card }}
          className="flex-1 rounded-2xl p-4"
        >
          <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={24} />
        </View>
        <View
          style={{ backgroundColor: colors.card }}
          className="flex-1 rounded-2xl p-4"
        >
          <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={24} />
        </View>
      </View>

      {/* Info card */}
      <View
        style={{ backgroundColor: colors.card }}
        className="rounded-2xl p-4 mb-4"
      >
        <Skeleton width="40%" height={18} style={{ marginBottom: 16 }} />
        {infoRows.map((i) => (
          <View key={`info-${i}`} className="flex-row items-center mb-3">
            <Skeleton width={24} height={24} borderRadius={4} />
            <View className="ml-3 flex-1">
              <Skeleton width="30%" height={12} style={{ marginBottom: 4 }} />
              <Skeleton width="60%" height={16} />
            </View>
          </View>
        ))}
      </View>

      {/* Payment history header */}
      <View
        style={{ backgroundColor: colors.card }}
        className="rounded-2xl p-4"
      >
        <Skeleton width="50%" height={18} style={{ marginBottom: 16 }} />
        {paymentRows.map((i) => (
          <View key={`payment-${i}`} className="mb-3">
            <Skeleton width="100%" height={60} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default React.memo(SkeletonClientDetail);
