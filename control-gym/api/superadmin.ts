import { apiClient } from "./client";
import {
  SuperAdminOverview,
  SuperAdminSummary,
  SuperAdminEntry,
  GymDetailResponse,
  GymClientsResponse,
  GymPaymentsResponse,
  GymAccessLogsResponse,
  GymStaffMember,
  CreateGymData,
} from "@/types/superadmin";

export async function fetchSuperAdminOverview(): Promise<SuperAdminOverview> {
  return apiClient<SuperAdminOverview>("/api/superadmin/overview");
}

export async function fetchSuperAdminSummary(): Promise<SuperAdminSummary> {
  return apiClient<SuperAdminSummary>("/api/superadmin/summary");
}

export async function fetchPendingRegistrations(): Promise<SuperAdminEntry[]> {
  const data = await apiClient<{ pendingAdmins: SuperAdminEntry[] }>(
    "/api/superadmin/pending-registrations",
  );
  return data.pendingAdmins || [];
}

export async function fetchGymDetail(
  gymId: string,
): Promise<GymDetailResponse> {
  return apiClient<GymDetailResponse>(`/api/superadmin/gyms/${gymId}/detail`);
}

export async function fetchGymClients(
  gymId: string,
  params?: { search?: string; status?: string; limit?: number },
): Promise<GymClientsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiClient<GymClientsResponse>(
    `/api/superadmin/gyms/${gymId}/clients${qs ? `?${qs}` : ""}`,
  );
}

export async function fetchGymPayments(
  gymId: string,
  limit?: number,
): Promise<GymPaymentsResponse> {
  const qs = limit ? `?limit=${limit}` : "";
  return apiClient<GymPaymentsResponse>(
    `/api/superadmin/gyms/${gymId}/payments${qs}`,
  );
}

export async function fetchGymAccessLogs(
  gymId: string,
  limit?: number,
): Promise<GymAccessLogsResponse> {
  const qs = limit ? `?limit=${limit}` : "";
  return apiClient<GymAccessLogsResponse>(
    `/api/superadmin/gyms/${gymId}/access-logs${qs}`,
  );
}

export async function fetchGymStaff(
  gymId: string,
): Promise<GymStaffMember[]> {
  return apiClient<GymStaffMember[]>(
    `/api/superadmin/gyms/${gymId}/staff`,
  );
}

export async function createGym(data: CreateGymData): Promise<{ message: string; gymId: string }> {
  return apiClient<{ message: string; gymId: string }>("/api/superadmin/gyms", {
    method: "POST",
    body: data,
  });
}

export async function toggleGymActive(
  gymId: string,
  active: boolean,
): Promise<void> {
  await apiClient(`/api/superadmin/gyms/${gymId}/active`, {
    method: "PUT",
    body: { active },
  });
}

export async function reviewGymRegistration(
  gymId: string,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<void> {
  await apiClient(`/api/superadmin/gyms/${gymId}/registration-review`, {
    method: "PUT",
    body: { action, rejectionReason },
  });
}

export async function updateGym(
  gymId: string,
  data: { name?: string; address?: string; plan?: string },
): Promise<void> {
  await apiClient(`/api/superadmin/gyms/${gymId}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteGym(gymId: string): Promise<void> {
  await apiClient(`/api/superadmin/gyms/${gymId}`, {
    method: "DELETE",
  });
}

export async function resetAdminPassword(
  adminId: string,
  newPassword: string,
): Promise<void> {
  await apiClient(`/api/superadmin/admins/${adminId}/reset-password`, {
    method: "PUT",
    body: { newPassword },
  });
}

export interface MembershipHistory {
  _id: string;
  plan: "basico" | "pro" | "proplus";
  amount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  paymentReference?: string;
  paymentProofUrl?: string;
  reviewStatus?: "pending" | "approved" | "rejected" | "manual";
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt?: string;
}

export async function fetchMembershipHistory(
  gymId: string,
): Promise<MembershipHistory[]> {
  return apiClient<MembershipHistory[]>(
    `/api/superadmin/gyms/${gymId}/memberships`,
  );
}
