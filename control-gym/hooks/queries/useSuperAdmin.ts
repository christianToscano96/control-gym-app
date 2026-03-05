import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  fetchSuperAdminOverview,
  fetchSuperAdminSummary,
  fetchSuperAdminAdmins,
  fetchSuperAdminPlanPrices,
  updateSuperAdminPlanPrices,
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
  PlanPrices,
  SuperAdminAdminsPageResponse,
} from "@/api/superadmin";
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

export function useSuperAdminSummaryQuery(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery<SuperAdminSummary>({
    queryKey: queryKeys.superadmin.summary,
    queryFn: fetchSuperAdminSummary,
    staleTime: 15000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useSuperAdminAdminsInfiniteQuery(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "pending";
}) {
  const limit = options?.limit ?? 20;
  const search = options?.search || "";
  const status = options?.status;

  return useInfiniteQuery<SuperAdminAdminsPageResponse>({
    queryKey: [
      ...queryKeys.superadmin.admins,
      { limit, search, status },
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchSuperAdminAdmins({
        page: Number(pageParam) || 1,
        limit,
        search,
        status,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 15000,
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

export function useSuperAdminPlanPricesQuery() {
  return useQuery<PlanPrices>({
    queryKey: queryKeys.superadmin.planPrices,
    queryFn: fetchSuperAdminPlanPrices,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
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
      await queryClient.cancelQueries({ queryKey: queryKeys.superadmin.summary });
      await queryClient.cancelQueries({ queryKey: queryKeys.superadmin.admins });
      await queryClient.cancelQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.superadmin.gymDetail(gymId),
      });

      const previousOverview = queryClient.getQueryData<SuperAdminOverview>(
        queryKeys.superadmin.overview,
      );
      const previousSummary = queryClient.getQueryData<SuperAdminSummary>(
        queryKeys.superadmin.summary,
      );
      const previousAdmins = queryClient.getQueryData<SuperAdminEntry[]>(
        queryKeys.superadmin.admins,
      );
      const previousPendingRegistrations = queryClient.getQueryData<
        SuperAdminEntry[]
      >(queryKeys.superadmin.pendingRegistrations);
      const previousGymDetail = queryClient.getQueryData<GymDetailResponse>(
        queryKeys.superadmin.gymDetail(gymId),
      );

      const nextStatus: "approved" | "rejected" =
        action === "approve" ? "approved" : "rejected";
      const nextActive = action === "approve";

      if (previousOverview) {
        queryClient.setQueryData<SuperAdminOverview>(
          queryKeys.superadmin.overview,
          (old) => {
            if (!old) return old;
            let oldCategory: "pending" | "active" | "inactive" | null = null;
            let newCategory: "pending" | "active" | "inactive" | null = null;

            const getCategory = (
              status: "pending" | "approved" | "rejected",
              active: boolean,
            ): "pending" | "active" | "inactive" | null => {
              if (status === "pending") return "pending";
              if (status === "approved" && active) return "active";
              if (status === "approved" && !active) return "inactive";
              return null;
            };

            const admins = old.admins.map((admin) => {
              if (!admin.gym || admin.gym._id !== gymId) return admin;
              oldCategory = getCategory(admin.gym.onboardingStatus, admin.gym.active);
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
              if (oldCategory === "pending") summary.pendingGyms = Math.max(0, summary.pendingGyms - 1);
              if (oldCategory === "active") summary.activeGyms = Math.max(0, summary.activeGyms - 1);
              if (oldCategory === "inactive") summary.inactiveGyms = Math.max(0, summary.inactiveGyms - 1);
              if (newCategory === "pending") summary.pendingGyms += 1;
              if (newCategory === "active") summary.activeGyms += 1;
              if (newCategory === "inactive") summary.inactiveGyms += 1;
            } else if (oldCategory && !newCategory) {
              if (oldCategory === "pending") summary.pendingGyms = Math.max(0, summary.pendingGyms - 1);
              if (oldCategory === "active") summary.activeGyms = Math.max(0, summary.activeGyms - 1);
              if (oldCategory === "inactive") summary.inactiveGyms = Math.max(0, summary.inactiveGyms - 1);
            } else if (!oldCategory && newCategory) {
              if (newCategory === "pending") summary.pendingGyms += 1;
              if (newCategory === "active") summary.activeGyms += 1;
              if (newCategory === "inactive") summary.inactiveGyms += 1;
            }

            return { ...old, admins, summary };
          },
        );
      }

      if (previousSummary) {
        queryClient.setQueryData<SuperAdminSummary>(
          queryKeys.superadmin.summary,
          (old) => {
            if (!old) return old;
            const oldCategory: "pending" | "active" | "inactive" =
              "pending";
            let newCategory: "pending" | "active" | "inactive" | null = null;
            if (nextStatus === "approved" && nextActive) newCategory = "active";
            if (nextStatus === "approved" && !nextActive) newCategory = "inactive";

            const next = { ...old };
            if (oldCategory === "pending") {
              next.pendingGyms = Math.max(0, next.pendingGyms - 1);
            }
            if (newCategory === "active") next.activeGyms += 1;
            if (newCategory === "inactive") next.inactiveGyms += 1;
            return {
              ...next,
            };
          },
        );
      }

      if (previousAdmins) {
        queryClient.setQueryData<SuperAdminEntry[]>(queryKeys.superadmin.admins, (old) => {
          if (!old) return old;
          return old.map((admin) =>
            admin.gym?._id === gymId
              ? {
                  ...admin,
                  gym: {
                    ...admin.gym,
                    onboardingStatus: nextStatus,
                    active: nextActive,
                  },
                }
              : admin,
          );
        });
      }

      if (previousPendingRegistrations) {
        queryClient.setQueryData<SuperAdminEntry[]>(
          queryKeys.superadmin.pendingRegistrations,
          (old) => (old ? old.filter((item) => item.gym?._id !== gymId) : old),
        );
      }

      if (previousGymDetail) {
        queryClient.setQueryData<GymDetailResponse>(
          queryKeys.superadmin.gymDetail(gymId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              gym: {
                ...old.gym,
                onboardingStatus: nextStatus,
                active: nextActive,
                paymentRejectionReason: nextActive
                  ? null
                  : rejectionReason ||
                    old.gym.paymentRejectionReason ||
                    "Comprobante rechazado",
              },
            };
          },
        );
      }

      return {
        previousOverview,
        previousSummary,
        previousAdmins,
        previousPendingRegistrations,
        previousGymDetail,
        gymId,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousOverview) {
        queryClient.setQueryData(queryKeys.superadmin.overview, context.previousOverview);
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(queryKeys.superadmin.summary, context.previousSummary);
      }
      if (context?.previousAdmins) {
        queryClient.setQueryData(queryKeys.superadmin.admins, context.previousAdmins);
      }
      if (context?.previousPendingRegistrations) {
        queryClient.setQueryData(
          queryKeys.superadmin.pendingRegistrations,
          context.previousPendingRegistrations,
        );
      }
      if (context?.previousGymDetail && context?.gymId) {
        queryClient.setQueryData(
          queryKeys.superadmin.gymDetail(context.gymId),
          context.previousGymDetail,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
      });
    },
  });
}

export function useDeleteGym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gymId: string) => deleteGym(gymId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
      });
    },
  });
}

export function useUpdateSuperAdminPlanPrices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planPrices: PlanPrices) => updateSuperAdminPlanPrices(planPrices),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.planPrices });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.admins });
      queryClient.invalidateQueries({
        queryKey: queryKeys.superadmin.pendingRegistrations,
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
