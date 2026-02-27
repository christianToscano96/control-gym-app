import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPeriodPricing,
  updatePeriodPricing,
  PeriodPricingData,
} from "@/api/periodPricing";
import { queryKeys } from "./queryKeys";

export function usePeriodPricingQuery() {
  return useQuery({
    queryKey: queryKeys.periodPricing.current,
    queryFn: fetchPeriodPricing,
  });
}

export function useUpdatePeriodPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PeriodPricingData) => updatePeriodPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.periodPricing.current,
      });
    },
  });
}
