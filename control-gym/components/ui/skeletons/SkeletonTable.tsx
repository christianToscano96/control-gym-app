import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader genérico para secciones de tabla o listado
 */
const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const { colors } = useTheme();

  // Memoizar array de filas para evitar recrear en cada render
  const tableRows = useMemo(
    () => Array.from({ length: rows }, (_, i) => i),
    [rows],
  );

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="rounded-2xl p-4 mb-4"
    >
      {/* Header */}
      <View
        className="flex-row justify-between mb-4 pb-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Skeleton width="30%" height={16} />
        <Skeleton width="20%" height={16} />
      </View>

      {/* Rows */}
      {tableRows.map((index) => (
        <View
          key={`row-${index}`}
          className="flex-row items-center justify-between py-3 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center flex-1">
            <Skeleton width={40} height={40} borderRadius={20} />
            <View className="ml-3 flex-1">
              <Skeleton width="70%" height={14} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
};

export default React.memo(SkeletonTable);
