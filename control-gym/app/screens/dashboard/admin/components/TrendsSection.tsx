import React from "react";
import { Text } from "react-native";
import AttendanceChart from "@/components/ui/AttendanceChart";
import PeakHoursChart from "@/components/ui/PeakHoursChart";
import ActivityRateChart from "@/components/ui/ActivityRateChart";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  weeklyData: any;
  peakHours: any[];
  activityData: any;
}

export function TrendsSection({ weeklyData, peakHours, activityData }: Props) {
  const { colors } = useTheme();

  return (
    <>
      <Text
        style={{ color: colors.textSecondary }}
        className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-1"
      >
        Tendencias
      </Text>

      <AttendanceChart
        data={weeklyData?.weeklyAttendance || []}
        totalValue={weeklyData?.totalWeekly ?? 0}
        trendText={weeklyData?.trendPercent || "0% VS LA SEMANA PASADA"}
        highlightLabel={weeklyData?.highlightDay}
      />
      <PeakHoursChart data={peakHours} />
      <ActivityRateChart
        activeCount={activityData?.activeCount ?? 0}
        inactiveCount={activityData?.inactiveCount ?? 0}
        activityRate={activityData?.activityRate ?? 0}
      />
    </>
  );
}
