import React, { useMemo } from "react";
import { View } from "react-native";
import SkeletonReportCard from "./SkeletonReportCard";

interface SkeletonReportsListProps {
  count?: number;
}

/**
 * Skeleton loader para la lista de reportes
 */
const SkeletonReportsList: React.FC<SkeletonReportsListProps> = ({
  count = 5,
}) => {
  // Memoizar array para evitar recrear en cada render
  const skeletonItems = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count],
  );

  return (
    <View className="px-5">
      {skeletonItems.map((index) => (
        <SkeletonReportCard key={`skeleton-report-${index}`} />
      ))}
    </View>
  );
};

export default React.memo(SkeletonReportsList);
