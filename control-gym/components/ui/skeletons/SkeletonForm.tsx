import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader para formularios (como el de añadir staff o cliente)
 */
const SkeletonForm: React.FC = () => {
  const { colors } = useTheme();

  // Memoizar array de campos para evitar recrear en cada render
  const formFields = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <View className="p-5">
      {/* Avatar picker */}
      <View className="items-center mb-6">
        <Skeleton width={120} height={120} borderRadius={60} />
        <Skeleton width={120} height={16} style={{ marginTop: 12 }} />
      </View>

      {/* Form fields */}
      {formFields.map((i) => (
        <View key={`field-${i}`} className="mb-4">
          <Skeleton width="30%" height={14} style={{ marginBottom: 8 }} />
          <View
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            className="rounded-xl border p-4"
          >
            <Skeleton width="60%" height={16} />
          </View>
        </View>
      ))}

      {/* Buttons */}
      <View className="flex-row gap-3 mt-6">
        <Skeleton width="48%" height={48} borderRadius={12} />
        <Skeleton width="48%" height={48} borderRadius={12} />
      </View>
    </View>
  );
};

export default React.memo(SkeletonForm);
