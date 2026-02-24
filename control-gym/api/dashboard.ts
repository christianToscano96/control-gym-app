import { apiClient } from "./client";

export interface DashboardStats {
  totalClients: number;
  clientsPercent: string;
  todayCheckIns: number;
  checkInsPercent: string;
  monthlyRevenue: number;
  revenuePercent: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>("/api/dashboard/stats");
}
