import { apiClient } from "./client";
import { SuperAdminOverview, GymDetailResponse } from "@/types/superadmin";

export async function fetchSuperAdminOverview(): Promise<SuperAdminOverview> {
  return apiClient<SuperAdminOverview>("/api/superadmin/overview");
}

export async function fetchGymDetail(gymId: string): Promise<GymDetailResponse> {
  return apiClient<GymDetailResponse>(`/api/superadmin/gyms/${gymId}/detail`);
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
