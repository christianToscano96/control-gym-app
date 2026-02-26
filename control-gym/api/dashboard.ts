import { apiClient } from "./client";

export interface PeakHourData {
  label: string;
  value: number;
}

export interface DashboardStats {
  totalClients: number;
  clientsPercent: string;
  todayCheckIns: number;
  checkInsPercent: string;
  monthlyRevenue: number;
  revenuePercent: string;
  peakHours: PeakHourData[];
}

export interface RecentCheckIn {
  _id: string;
  clientName: string;
  membershipType: string;
  method: string;
  date: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>("/api/dashboard/stats");
}

export async function getRecentCheckIns(): Promise<RecentCheckIn[]> {
  return apiClient<RecentCheckIn[]>("/api/access/recent");
}

export interface WeeklyAttendance {
  weeklyAttendance: { value: number; label: string }[];
  totalWeekly: number;
  trendPercent: string;
  highlightDay: string;
}

export async function getWeeklyAttendance(): Promise<WeeklyAttendance> {
  return apiClient<WeeklyAttendance>("/api/dashboard/weekly-attendance");
}

export interface ActivityRateData {
  activeCount: number;
  inactiveCount: number;
  activityRate: number;
}

export async function getActivityRate(): Promise<ActivityRateData> {
  return apiClient<ActivityRateData>("/api/dashboard/activity-rate");
}
