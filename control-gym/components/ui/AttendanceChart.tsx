import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export interface AttendanceChartData {
  value: number;
  label: string;
}

export interface AttendanceChartProps {
  data: AttendanceChartData[];
  title?: string;
  subtitle?: string;
  totalValue?: number | string;
  trendText?: string;
  highlightLabel?: string;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data,
  title = "Asistencia diaria",
  subtitle = "Tendencias de esta semana",
  totalValue = 582,
  trendText = "+8.2% VS LA SEMANA PASADA",
  highlightLabel = "VIERNES",
}) => {
  const chartData = data.map((item) =>
    item.label === highlightLabel
      ? {
          ...item,
          labelTextStyle:
            "text-[10px] text-green-500 font-bold text-center w-10",
        }
      : {
          ...item,
          labelTextStyle:
            "text-[10px] text-slate-400 font-bold text-center w-10",
        },
  );

  return (
    <View className="bg-white rounded-2xl p-5 mx-1 my-2 shadow-sm shadow-black/5">
      <View className="flex-row justify-between items-start mb-5">
        <View>
          <Text className="text-lg font-extrabold text-neutral-900">
            {title}
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-black text-neutral-900">
            {totalValue}
          </Text>
          <Text className="text-[10px] font-bold text-green-500 mt-0.5">
            {trendText}
          </Text>
        </View>
      </View>
      <View className="mt-2 w-full">
        <LineChart
          areaChart
          curved
          data={chartData}
          height={120}
          spacing={45}
          initialSpacing={10}
          color="#2ECC71"
          thickness={3}
          startFillColor="rgba(46, 204, 113, 0.3)"
          endFillColor="rgba(46, 204, 113, 0.01)"
          startOpacity={0.4}
          endOpacity={0.1}
          hideRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          pointerConfig={{
            pointerStripColor: "#2ECC71",
            pointerLabelComponent: (items: AttendanceChartData[]) => (
              <View className="bg-green-500 px-1 rounded">
                <Text className="text-white font-bold">{items[0].value}</Text>
              </View>
            ),
          }}
          style={{ width: "100%" }}
        />
      </View>
    </View>
  );
};

export default AttendanceChart;
