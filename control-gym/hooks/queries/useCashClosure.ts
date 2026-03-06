import {
  closeCashRegister,
  getCashClosureHistory,
  getTodayCashSummary,
} from "@/api/cashClosure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

export function useTodayCashSummaryQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.cashClosure.today,
    queryFn: getTodayCashSummary,
    enabled,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCashClosureHistoryQuery(limit = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.cashClosure.history(limit),
    queryFn: () => getCashClosureHistory(limit),
    enabled,
    staleTime: 30000,
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
