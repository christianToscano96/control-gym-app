import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para ReportCard
 */
const SkeletonReportCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      className="rounded-2xl p-4 mb-3 border"
    >
      {/* Header con tipo e icono */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Skeleton width={40} height={40} borderRadius={20} />
          <View className="ml-3 flex-1">
            <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
        <Skeleton width={24} height={24} borderRadius={4} />
      </View>

      {/* Descripción */}
      <View className="mb-3">
        <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="80%" height={14} />
      </View>

      {/* Footer con fecha y botón */}
      <View
        className="flex-row items-center justify-between pt-3 border-t"
        style={{ borderTopColor: colors.border }}
      >
        <Skeleton width={80} height={12} />
        <Skeleton width={100} height={32} borderRadius={8} />
      </View>
    </View>
  );
};

export default React.memo(SkeletonReportCard);
