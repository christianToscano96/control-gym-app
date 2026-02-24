import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStaff,
  fetchStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  updateStaffPassword,
  searchStaff,
} from "@/api/staff";
import { queryKeys } from "./queryKeys";

// ─── Queries ─────────────────────────────────────────────────────

export function useStaffQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.staff.all,
    queryFn: fetchStaff,
    enabled,
  });
}

export function useStaffDetailQuery(staffId: string) {
  return useQuery({
    queryKey: queryKeys.staff.detail(staffId),
    queryFn: () => fetchStaffById(staffId),
    enabled: !!staffId,
  });
}

export function useStaffSearchQuery(query: string) {
  return useQuery({
    queryKey: queryKeys.staff.search(query),
    queryFn: () => searchStaff(query),
    enabled: query.length > 0,
  });
}

// ─── Mutations ───────────────────────────────────────────────────

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createStaff(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, formData }: { staffId: string; formData: FormData }) =>
      updateStaff(staffId, formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.detail(variables.staffId),
      });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => deleteStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useToggleStaffStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => toggleStaffStatus(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useUpdateStaffPassword() {
  return useMutation({
    mutationFn: ({ staffId, password }: { staffId: string; password: string }) =>
      updateStaffPassword(staffId, password),
  });
}
