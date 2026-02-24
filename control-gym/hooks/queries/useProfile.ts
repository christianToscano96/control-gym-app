import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  UpdateProfileData,
} from "@/api/user";
import { queryKeys } from "./queryKeys";

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => uploadAvatar(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current });
    },
  });
}
