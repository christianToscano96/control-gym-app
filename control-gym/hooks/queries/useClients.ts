import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClients, fetchClientById, fetchClientPayments } from "@/api/clients";
import { apiClient } from "@/api/client";
import { queryKeys } from "./queryKeys";

// ─── Queries ─────────────────────────────────────────────────────

export function useClientsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.clients.all,
    queryFn: fetchClients,
    enabled,
  });
}

export function useClientDetailQuery(clientId: string | string[]) {
  const id = String(clientId);
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => fetchClientById(id),
    enabled: !!id,
  });
}

export function useClientPaymentsQuery(clientId: string) {
  const id = String(clientId);
  return useQuery({
    queryKey: queryKeys.clients.payments(id),
    queryFn: () => fetchClientPayments(id),
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────

interface CreateClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  instagramLink?: string;
  paymentMethod: string;
  membershipType: string;
  isActive: boolean;
  startDate: Date | null;
  selected_period: string;
  dni?: string;
  paymentAmount?: number;
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientData) =>
      apiClient("/api/clients", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) =>
      apiClient(`/api/clients/${clientId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, ...data }: { clientId: string; [key: string]: any }) =>
      apiClient(`/api/clients/${clientId}`, { method: "PUT", body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}
