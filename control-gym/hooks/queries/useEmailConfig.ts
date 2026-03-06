import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EmailConfigScope,
  fetchEmailConfig,
  updateEmailConfig,
  UpdateEmailConfigData,
} from "@/api/emailConfig";
import { queryKeys } from "./queryKeys";

export function useEmailConfigQuery(scope: EmailConfigScope = "admin") {
  return useQuery({
    queryKey: queryKeys.emailConfig.current(scope),
    queryFn: () => fetchEmailConfig(scope),
  });
}

export function useUpdateEmailConfig(scope: EmailConfigScope = "admin") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmailConfigData) => updateEmailConfig(data, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailConfig.current(scope),
      });
    },
  });
}
