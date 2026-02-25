import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmailConfig,
  updateEmailConfig,
  UpdateEmailConfigData,
} from "@/api/emailConfig";
import { queryKeys } from "./queryKeys";

export function useEmailConfigQuery() {
  return useQuery({
    queryKey: queryKeys.emailConfig.current,
    queryFn: fetchEmailConfig,
  });
}

export function useUpdateEmailConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmailConfigData) => updateEmailConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailConfig.current,
      });
    },
  });
}
