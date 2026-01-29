import { API_BASE_URL } from "@/constants/api";

export interface DashboardStats {
  totalClients: number;
  clientsPercent: string;
  todayCheckIns: number;
  checkInsPercent: string;
  monthlyRevenue: number;
  revenuePercent: string;
}

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error("Error al obtener estadísticas");
  }
  
  return res.json();
}
