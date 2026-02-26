import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useTheme } from "@/context/ThemeContext";

export interface ActivityRateChartProps {
  activeCount: number;
  inactiveCount: number;
  activityRate: number;
  title?: string;
  subtitle?: string;
}

const ACTIVE_COLOR = "#22c55e";
const INACTIVE_COLOR = "#1e293b";

const ActivityRateChart: React.FC<ActivityRateChartProps> = ({
  activeCount,
  inactiveCount,
  activityRate,
  title = "Tasa de actividad",
  subtitle = "Clientes activos vs inactivos",
}) => {
  const { colors, isDark } = useTheme();

  const total = activeCount + inactiveCount;
  const hasData = total > 0;

  const inactiveColor = isDark ? INACTIVE_COLOR : "#cbd5e1";

  if (!hasData) {
    return (
      <View
        style={{ backgroundColor: colors.card }}
        className="rounded-2xl p-5 mx-1 my-2 shadow-sm shadow-black/5"
      >
        <Text
          style={{ color: colors.text }}
          className="text-lg font-extrabold"
        >
          {title}
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-xs mt-0.5"
        >
          {subtitle}
        </Text>
        <View className="items-center py-8">
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Sin clientes registrados
          </Text>
        </View>
      </View>
    );
  }

  const pieData = [
    {
      value: activeCount,
      color: ACTIVE_COLOR,
    },
    {
      value: inactiveCount,
      color: inactiveColor,
    },
  ];

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="rounded-2xl p-5 mx-1 my-2 shadow-sm shadow-black/5"
    >
      <Text
        style={{ color: colors.text }}
        className="text-lg font-extrabold"
      >
        {title}
      </Text>
      <Text
        style={{ color: colors.textSecondary }}
        className="text-xs mt-0.5"
      >
        {subtitle}
      </Text>

      <View className="items-center mt-4">
        <PieChart
          data={pieData}
          donut
          radius={80}
          innerRadius={55}
          innerCircleColor={colors.card}
          centerLabelComponent={() => (
            <View className="items-center justify-center">
              <Text
                style={{ color: colors.text }}
                className="text-2xl font-black"
              >
                {activityRate}%
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-[10px] font-semibold"
              >
                ACTIVOS
              </Text>
            </View>
          )}
        />
      </View>

      <View className="flex-row justify-center mt-4 gap-6">
        <View className="flex-row items-center">
          <View
            style={{ backgroundColor: ACTIVE_COLOR }}
            className="w-3 h-3 rounded-full mr-2"
          />
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold"
          >
            Activos ({activeCount})
          </Text>
        </View>
        <View className="flex-row items-center">
          <View
            style={{ backgroundColor: inactiveColor }}
            className="w-3 h-3 rounded-full mr-2"
          />
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold"
          >
            Inactivos ({inactiveCount})
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ActivityRateChart;
