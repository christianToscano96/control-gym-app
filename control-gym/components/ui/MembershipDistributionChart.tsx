import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useTheme } from "@/context/ThemeContext";

export interface MembershipDistributionChartProps {
  basico: number;
  pro: number;
  proplus: number;
  total: number;
  title?: string;
  subtitle?: string;
}

const BASICO_COLOR = "#3B82F6";
const PRO_COLOR = "#8B5CF6";
const PROPLUS_COLOR = "#22c55e";

const MembershipDistributionChart: React.FC<MembershipDistributionChartProps> = ({
  basico,
  pro,
  proplus,
  total,
  title = "Distribución de membresías",
  subtitle = "Tipos de plan activos",
}) => {
  const { colors } = useTheme();
  const hasData = total > 0;

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
            Sin membresías registradas
          </Text>
        </View>
      </View>
    );
  }

  const pieData = [
    { value: basico, color: BASICO_COLOR },
    { value: pro, color: PRO_COLOR },
    { value: proplus, color: PROPLUS_COLOR },
  ];

  const legendItems = [
    { label: "Básico", count: basico, color: BASICO_COLOR },
    { label: "Pro", count: pro, color: PRO_COLOR },
    { label: "Pro+", count: proplus, color: PROPLUS_COLOR },
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
                {total}
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-[10px] font-semibold"
              >
                TOTAL
              </Text>
            </View>
          )}
        />
      </View>

      <View className="flex-row justify-center mt-4 gap-4">
        {legendItems.map((item) => (
          <View key={item.label} className="flex-row items-center">
            <View
              style={{ backgroundColor: item.color }}
              className="w-3 h-3 rounded-full mr-2"
            />
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs font-semibold"
            >
              {item.label} ({item.count})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MembershipDistributionChart;
