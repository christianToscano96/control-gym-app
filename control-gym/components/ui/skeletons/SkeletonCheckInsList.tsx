import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import SkeletonCheckIn from "./SkeletonCheckIn";

interface SkeletonCheckInsListProps {
  count?: number;
}

/**
 * Skeleton loader para la lista completa de RecentCheckIns
 */
const SkeletonCheckInsList: React.FC<SkeletonCheckInsListProps> = ({
  count = 3,
}) => {
  const { colors } = useTheme();

  // Memoizar array para evitar recrear en cada render
  const skeletonItems = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count],
  );

  return (
    <View className="my-5 px-1">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text
          style={{ color: colors.text }}
          className="text-[20px] font-extrabold"
        >
          Check-ins Recientes
        </Text>
      </View>

      {/* Lista de skeleton items */}
      {skeletonItems.map((index) => (
        <SkeletonCheckIn key={`skeleton-checkin-${index}`} />
      ))}
    </View>
  );
};

export default React.memo(SkeletonCheckInsList);
