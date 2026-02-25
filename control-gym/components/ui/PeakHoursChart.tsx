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

  // Encontrar el valor máximo para resaltar la barra pico
  const peakValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;
  const dynamicMax = peakValue > 0 ? Math.ceil(peakValue * 1.2) : maxValue;

  const chartData = data.map((item) => ({
    ...item,
    frontColor: item.value === peakValue && peakValue > 0 ? primaryColor : "#E2E8F0",
  }));

  if (data.length === 0) {
    return (
      <View
        style={{ backgroundColor: colors.card }}
        className="rounded-2xl p-5 my-2 shadow-sm shadow-black/5"
      >
        <Text style={{ color: colors.text }} className="text-xl font-extrabold">
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm mb-4">
          {subtitle}
        </Text>
        <View className="items-center py-8">
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Sin ingresos registrados hoy
          </Text>
        </View>
      </View>
    );
  }

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
          barWidth={16}
          spacing={12}
          roundedTop
          hideRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          noOfSections={3}
          maxValue={dynamicMax}
          renderTooltip={(item: { value: number }) => (
            <View className="mb-1">
              <Text
                className="text-[10px] font-bold"
                style={{ color: primaryColor }}
              >
                {item.value}
              </Text>
            </View>
          )}
          xAxisLabelTextStyle={{
            color: primaryColor,
            fontSize: 8,
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
