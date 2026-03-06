import {
  closeCashRegister,
  getCashClosureHistory,
  getTodayCashSummary,
} from "@/api/cashClosure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

interface QueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useTodayCashSummaryQuery(options: QueryOptions = {}) {
  const { enabled = true, refetchInterval = 15_000 } = options;
  return useQuery({
    queryKey: queryKeys.cashClosure.today,
    queryFn: getTodayCashSummary,
    enabled,
    staleTime: 10_000,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCashClosureHistoryQuery(
  limit = 10,
  options: QueryOptions = {},
) {
  const { enabled = true, refetchInterval = false } = options;
  return useQuery({
    queryKey: queryKeys.cashClosure.history(limit),
    queryFn: () => getCashClosureHistory(limit),
    enabled,
    staleTime: 30_000,
    refetchInterval,
  });
}

export function useCloseCashRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeCashRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cashClosure.today });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashClosure.history(10) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}
