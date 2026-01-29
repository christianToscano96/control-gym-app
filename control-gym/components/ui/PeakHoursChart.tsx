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
  const { primaryColor, colors } = useTheme();
  const chartData = data.map((item) =>
    item.label === "6PM"
      ? { ...item, frontColor: primaryColor }
      : { ...item, frontColor: "#E2E8F0" },
  );

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="rounded-2xl p-5 my-2 shadow-sm shadow-black/5"
    >
      <Text style={{ color: colors.text }} className="text-xl font-extrabold">
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm mb-6">
        {subtitle}
      </Text>
      <View
        style={{ backgroundColor: colors.background }}
        className="items-center justify-center w-full rounded-xl py-2 px-2"
      >
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
