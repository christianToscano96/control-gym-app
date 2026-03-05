import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSuperAdminOverview,
  fetchPendingRegistrations,
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
  SuperAdminEntry,
  GymDetailResponse,
  GymClientsResponse,
  GymPaymentsResponse,
  GymAccessLogsResponse,
  GymStaffMember,
  CreateGymData,
} from "@/types/superadmin";
import { queryKeys } from "./queryKeys";

export function useSuperAdminOverviewQuery(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery<SuperAdminOverview>({
    queryKey: queryKeys.superadmin.overview,
    queryFn: fetchSuperAdminOverview,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function usePendingRegistrationsQuery(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery<SuperAdminEntry[]>({
    queryKey: queryKeys.superadmin.pendingRegistrations,
    queryFn: fetchPendingRegistrations,
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
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
    onMutate: async ({ gymId, action, rejectionReason }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.superadmin.overview });
      await queryClient.cancelQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.superadmin.gymDetail(gymId),
      });

      const previousOverview = queryClient.getQueryData<SuperAdminOverview>(
        queryKeys.superadmin.overview,
      );
      const previousGymDetail = queryClient.getQueryData<GymDetailResponse>(
        queryKeys.superadmin.gymDetail(gymId),
      );
      const previousPendingRegistrations = queryClient.getQueryData<
        SuperAdminEntry[]
      >(queryKeys.superadmin.pendingRegistrations);

      const getCategory = (
        status: "pending" | "approved" | "rejected",
        active: boolean,
      ): "pending" | "active" | "inactive" => {
        if (status === "pending") return "pending";
        if (status === "approved" && active) return "active";
        return "inactive";
      };

      if (previousOverview) {
        queryClient.setQueryData<SuperAdminOverview>(
          queryKeys.superadmin.overview,
          (old) => {
            if (!old) return old;
            const nextStatus: "approved" | "rejected" =
              action === "approve" ? "approved" : "rejected";
            const nextActive = action === "approve";

            let oldCategory: "pending" | "active" | "inactive" | null = null;
            let newCategory: "pending" | "active" | "inactive" | null = null;

            const updatedAdmins = old.admins.map((admin) => {
              if (!admin.gym || admin.gym._id !== gymId) return admin;

              oldCategory = getCategory(
                admin.gym.onboardingStatus,
                admin.gym.active,
              );
              newCategory = getCategory(nextStatus, nextActive);

              return {
                ...admin,
                gym: {
                  ...admin.gym,
                  onboardingStatus: nextStatus,
                  active: nextActive,
                },
              };
            });

            const summary = { ...old.summary };
            if (oldCategory && newCategory && oldCategory !== newCategory) {
              if (oldCategory === "pending") {
                summary.pendingGyms = Math.max(0, summary.pendingGyms - 1);
              }
              if (oldCategory === "active") {
                summary.activeGyms = Math.max(0, summary.activeGyms - 1);
              }
              if (oldCategory === "inactive") {
                summary.inactiveGyms = Math.max(0, summary.inactiveGyms - 1);
              }

              if (newCategory === "pending") summary.pendingGyms += 1;
              if (newCategory === "active") summary.activeGyms += 1;
              if (newCategory === "inactive") summary.inactiveGyms += 1;
            }

            return {
              ...old,
              admins: updatedAdmins,
              summary,
            };
          },
        );
      }

      if (previousGymDetail) {
        queryClient.setQueryData<GymDetailResponse>(
          queryKeys.superadmin.gymDetail(gymId),
          (old) => {
            if (!old) return old;
            const isApprove = action === "approve";
            return {
              ...old,
              gym: {
                ...old.gym,
                onboardingStatus: isApprove ? "approved" : "rejected",
                active: isApprove,
                paymentRejectionReason: isApprove
                  ? null
                  : rejectionReason ||
                    old.gym.paymentRejectionReason ||
                    "Comprobante rechazado",
              },
            };
          },
        );
      }

      if (previousPendingRegistrations) {
        if (action === "approve" || action === "reject") {
          queryClient.setQueryData<SuperAdminEntry[]>(
            queryKeys.superadmin.pendingRegistrations,
            (old) => (old ? old.filter((item) => item.gym?._id !== gymId) : old),
          );
        }
      }

      return {
        previousOverview,
        previousGymDetail,
        previousPendingRegistrations,
        gymId,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousOverview) {
        queryClient.setQueryData(
          queryKeys.superadmin.overview,
          context.previousOverview,
        );
      }
      if (context?.previousGymDetail && context?.gymId) {
        queryClient.setQueryData(
          queryKeys.superadmin.gymDetail(context.gymId),
          context.previousGymDetail,
        );
      }
      if (context?.previousPendingRegistrations) {
        queryClient.setQueryData(
          queryKeys.superadmin.pendingRegistrations,
          context.previousPendingRegistrations,
        );
      }
    },
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
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
