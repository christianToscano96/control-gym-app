import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para pantalla de perfil de usuario
 */
const SkeletonProfile: React.FC = () => {
  const { colors } = useTheme();

  const sections = useMemo(() => [1, 2, 3], []);

  return (
    <View className="flex-1 p-5">
      {/* Header con avatar grande */}
      <View className="items-center mb-8">
        <Skeleton width={120} height={120} borderRadius={60} />
        <View className="items-center mt-4">
          <Skeleton width={180} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={16} />
        </View>
      </View>

      {/* Stats horizontal */}
      <View className="flex-row justify-around mb-8">
        {[1, 2, 3].map((i) => (
          <View key={`stat-${i}`} className="items-center">
            <Skeleton width={60} height={28} style={{ marginBottom: 6 }} />
            <Skeleton width={80} height={14} />
          </View>
        ))}
      </View>

      {/* Secciones de información */}
      {sections.map((section) => (
        <View
          key={`section-${section}`}
          style={{ backgroundColor: colors.card }}
          className="rounded-2xl p-4 mb-4"
        >
          <Skeleton width="40%" height={18} style={{ marginBottom: 16 }} />
          {[1, 2, 3].map((i) => (
            <View key={`item-${section}-${i}`} className="flex-row items-center mb-3">
              <Skeleton width={40} height={40} borderRadius={20} />
              <View className="ml-3 flex-1">
                <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default React.memo(SkeletonProfile);
