import React, { useMemo } from "react";
import { View } from "react-native";
import SkeletonClientItem from "./SkeletonClientItem";

interface SkeletonClientsListProps {
  count?: number;
}

/**
 * Skeleton loader para la lista de clientes
 */
const SkeletonClientsList: React.FC<SkeletonClientsListProps> = ({
  count = 5,
}) => {
  // Memoizar array para evitar recrear en cada render
  const skeletonItems = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count],
  );

  return (
    <View className="p-5 mt-5 flex-1">
      {skeletonItems.map((index) => (
        <SkeletonClientItem key={`skeleton-client-${index}`} />
      ))}
    </View>
  );
};

export default React.memo(SkeletonClientsList);
