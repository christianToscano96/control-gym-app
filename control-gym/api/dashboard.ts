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
  todayDenied: number;
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
  status: "allowed" | "denied";
  denyReason?: string;
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

export interface MembershipDistribution {
  basico: number;
  pro: number;
  proplus: number;
  total: number;
}

export async function getMembershipDistribution(): Promise<MembershipDistribution> {
  return apiClient<MembershipDistribution>("/api/dashboard/membership-distribution");
}

export interface ExpiringMembership {
  _id: string;
  name: string;
  expiresAt: string;
  membershipType: string;
}

export interface ExpiringMemberships {
  count: number;
  clients: ExpiringMembership[];
}

export async function getExpiringMemberships(): Promise<ExpiringMemberships> {
  return apiClient<ExpiringMemberships>("/api/dashboard/expiring-memberships");
}

export interface GymSubscription {
  _id: string;
  plan: "basico" | "pro" | "proplus";
  amount: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export async function getGymSubscription(): Promise<GymSubscription | null> {
  const memberships = await apiClient<GymSubscription[]>("/api/membership");
  return memberships.find((m) => m.active) || null;
}
