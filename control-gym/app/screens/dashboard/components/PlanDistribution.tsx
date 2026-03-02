import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { planConfig } from "../hooks/useSuperAdminDashboard";

interface PlanDistributionProps {
  isLoading: boolean;
  planDistribution?: Record<string, number>;
}

export const PlanDistribution = ({
  isLoading,
  planDistribution,
}: PlanDistributionProps) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-row gap-2 px-1 mb-4">
      {(["basico", "pro", "proplus"] as const).map((plan) => {
        const config = planConfig[plan];
        const count = planDistribution?.[plan] ?? 0;
        return (
          <View
            key={plan}
            style={{
              flex: 1,
              backgroundColor: isDark ? `${config.color}15` : config.bg,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: config.color,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              {isLoading ? "..." : count}
            </Text>
            <Text
              style={{
                color: config.color,
                fontSize: 11,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {config.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
