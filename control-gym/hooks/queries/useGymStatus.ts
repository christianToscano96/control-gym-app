import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "./queryKeys";

interface GymStatus {
  active: boolean;
}

async function fetchGymStatus(): Promise<GymStatus> {
  return apiClient<GymStatus>("/api/auth/gym-status");
}

export function useGymStatusQuery(enabled: boolean = true) {
  return useQuery<GymStatus>({
    queryKey: queryKeys.gymStatus.current,
    queryFn: fetchGymStatus,
    enabled,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
}
