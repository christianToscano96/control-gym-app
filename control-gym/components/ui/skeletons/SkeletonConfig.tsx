import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para pantalla de configuración
 */
const SkeletonConfig: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View className="flex-1 p-5">
      {/* Sección de perfil */}
      <View
        style={{ backgroundColor: colors.card }}
        className="rounded-2xl p-4 mb-4"
      >
        <View className="flex-row items-center">
          <Skeleton width={64} height={64} borderRadius={32} />
          <View className="ml-4 flex-1">
            <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={14} />
          </View>
          <Skeleton width={24} height={24} borderRadius={4} />
        </View>
      </View>

      {/* Opciones de configuración */}
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={`option-${i}`}
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="rounded-2xl p-4 mb-3 flex-row items-center border"
        >
          <Skeleton width={40} height={40} borderRadius={20} />
          <View className="ml-4 flex-1">
            <Skeleton width="50%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={12} />
          </View>
          <Skeleton width={24} height={24} borderRadius={4} />
        </View>
      ))}

      {/* Botón de acción */}
      <View className="mt-6">
        <Skeleton width="100%" height={52} borderRadius={12} />
      </View>
    </View>
  );
};

export default React.memo(SkeletonConfig);
