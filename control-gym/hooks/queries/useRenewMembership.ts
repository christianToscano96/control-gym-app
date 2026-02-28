import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "./queryKeys";

interface RenewMembershipData {
  clientId: string;
  startDate: Date;
  selected_period: string;
  paymentMethod: "efectivo" | "transferencia";
  paymentAmount: number;
}

export function useRenewMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, ...data }: RenewMembershipData) =>
      apiClient(`/api/clients/${clientId}/renew`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.detail(variables.clientId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.expiringMemberships,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.activityRate,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.payments(variables.clientId),
      });
    },
  });
}
