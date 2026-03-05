import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSuperAdminOverview,
  fetchGymDetail,
  fetchGymClients,
  fetchGymPayments,
  fetchGymAccessLogs,
  fetchGymStaff,
  createGym,
  toggleGymActive,
  reviewGymRegistration,
  updateGym,
  deleteGym,
  resetAdminPassword,
  fetchMembershipHistory,
  MembershipHistory,
} from "@/api/superadmin";
import {
  SuperAdminOverview,
  GymDetailResponse,
  GymClientsResponse,
  GymPaymentsResponse,
  GymAccessLogsResponse,
  GymStaffMember,
  CreateGymData,
} from "@/types/superadmin";
import { queryKeys } from "./queryKeys";

export function useSuperAdminOverviewQuery() {
  return useQuery<SuperAdminOverview>({
    queryKey: queryKeys.superadmin.overview,
    queryFn: fetchSuperAdminOverview,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useGymDetailQuery(gymId: string) {
  return useQuery<GymDetailResponse>({
    queryKey: queryKeys.superadmin.gymDetail(gymId),
    queryFn: () => fetchGymDetail(gymId),
    enabled: !!gymId,
  });
}

export function useMembershipHistoryQuery(gymId: string) {
  return useQuery<MembershipHistory[]>({
    queryKey: queryKeys.superadmin.membershipHistory(gymId),
    queryFn: () => fetchMembershipHistory(gymId),
    enabled: !!gymId,
  });
}

export function useGymClientsQuery(
  gymId: string,
  params?: { search?: string; status?: string; limit?: number },
) {
  return useQuery<GymClientsResponse>({
    queryKey: [...queryKeys.superadmin.gymClients(gymId), params],
    queryFn: () => fetchGymClients(gymId, params),
    enabled: !!gymId,
  });
}

export function useGymPaymentsQuery(gymId: string, limit?: number) {
  return useQuery<GymPaymentsResponse>({
    queryKey: queryKeys.superadmin.gymPayments(gymId),
    queryFn: () => fetchGymPayments(gymId, limit),
    enabled: !!gymId,
  });
}

export function useGymAccessLogsQuery(gymId: string, limit?: number) {
  return useQuery<GymAccessLogsResponse>({
    queryKey: queryKeys.superadmin.gymAccessLogs(gymId),
    queryFn: () => fetchGymAccessLogs(gymId, limit),
    enabled: !!gymId,
  });
}

export function useGymStaffQuery(gymId: string) {
  return useQuery<GymStaffMember[]>({
    queryKey: queryKeys.superadmin.gymStaff(gymId),
    queryFn: () => fetchGymStaff(gymId),
    enabled: !!gymId,
  });
}

export function useCreateGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGymData) => createGym(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.overview,
      });
    },
  });
}

export function useToggleGymActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, active }: { gymId: string; active: boolean }) =>
      toggleGymActive(gymId, active),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.gymDetail(variables.gymId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.membershipHistory(variables.gymId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.overview,
      });
    },
  });
}

export function useReviewGymRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      gymId,
      action,
      rejectionReason,
    }: {
      gymId: string;
      action: "approve" | "reject";
      rejectionReason?: string;
    }) => reviewGymRegistration(gymId, action, rejectionReason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.gymDetail(variables.gymId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.membershipHistory(variables.gymId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.overview,
      });
    },
  });
}

export function useUpdateGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      gymId,
      data,
    }: {
      gymId: string;
      data: { name?: string; address?: string; plan?: string };
    }) => updateGym(gymId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.gymDetail(variables.gymId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.membershipHistory(variables.gymId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.overview,
      });
    },
  });
}

export function useDeleteGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gymId: string) => deleteGym(gymId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.overview,
      });
    },
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: ({
      adminId,
      newPassword,
    }: {
      adminId: string;
      newPassword: string;
    }) => resetAdminPassword(adminId, newPassword),
  });
}
