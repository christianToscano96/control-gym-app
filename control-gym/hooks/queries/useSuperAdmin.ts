import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSuperAdminOverview,
  fetchGymDetail,
  toggleGymActive,
} from "@/api/superadmin";
import { SuperAdminOverview, GymDetailResponse } from "@/types/superadmin";
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
        queryKey: queryKeys.superadmin.overview,
      });
    },
  });
}
