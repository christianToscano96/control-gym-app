import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "@/context/ThemeContext";

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
  const { colors } = useTheme();
  const chartData = data.map((item) =>
    item.label === highlightLabel
      ? {
          ...item,
          labelTextStyle: {
            fontSize: 10,
            color: "#22c55e",
            fontWeight: "700",
            textAlign: "center",
            width: 40,
          },
        }
      : {
          ...item,
          labelTextStyle: {
            fontSize: 10,
            color: colors.textSecondary,
            fontWeight: "700",
            textAlign: "center",
            width: 40,
          },
        },
  );

  return (
    <View
      style={{ backgroundColor: colors.card }}
      className="rounded-2xl p-5 mx-1 my-2 shadow-sm shadow-black/5"
    >
      <View className="flex-row justify-between items-start mb-5">
        <View>
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
        </View>
        <View className="items-end">
          <Text style={{ color: colors.text }} className="text-2xl font-black">
            {totalValue}
          </Text>
          <Text className="text-[10px] font-bold text-green-500 mt-0.5">
            {trendText}
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 8,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LineChart
          areaChart
          curved
          data={chartData}
          height={100}
          spacing={50}
          initialSpacing={20}
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
              <View
                style={{
                  backgroundColor: "#22c55e",
                  paddingHorizontal: 4,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {items[0].value}
                </Text>
              </View>
            ),
          }}
          style={{ width: 320, alignSelf: "center" }}
        />
      </View>
    </View>
  );
};

export default AttendanceChart;
