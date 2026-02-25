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
