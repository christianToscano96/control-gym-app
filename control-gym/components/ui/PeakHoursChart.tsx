import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export interface PeakHoursChartData {
  value: number;
  label: string;
  frontColor?: string;
}

export interface PeakHoursChartProps {
  data: PeakHoursChartData[];
  title?: string;
  subtitle?: string;
  maxValue?: number;
}

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({
  data,
  title = "Horas pico",
  subtitle = "Niveles de ocupación durante el día",
  maxValue = 100,
}) => {
  const { primaryColor } = useTheme();
  const chartData = data.map((item) =>
    item.label === "6PM"
      ? { ...item, frontColor: primaryColor }
      : { ...item, frontColor: "#E2E8F0" },
  );

  return (
    <View className="bg-white rounded-2xl p-5 my-2 shadow-sm shadow-black/5">
      <Text className="text-xl font-extrabold text-neutral-900">{title}</Text>
      <Text className="text-sm mb-6 text-gray-500">{subtitle}</Text>
      <View className="items-center justify-center w-full bg-slate-50 rounded-xl py-2 px-2">
        <BarChart
          data={chartData}
          barWidth={22}
          spacing={25}
          roundedTop
          hideRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          noOfSections={3}
          maxValue={maxValue}
          renderTooltip={(item: { value: number }) => (
            <View className="mb-1">
              <Text
                className="text-[10px] font-bold"
                style={{ color: primaryColor }}
              >
                {item.value}%
              </Text>
            </View>
          )}
          xAxisLabelTextStyle={{
            color: primaryColor,
            fontSize: 10,
            fontWeight: "600",
            marginTop: 10,
          }}
          xAxisLabelsHeight={30}
        />
      </View>
    </View>
  );
};

export default PeakHoursChart;
