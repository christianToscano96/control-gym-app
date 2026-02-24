import { apiClient } from "./client";

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

export async function getProfile() {
  return apiClient("/api/auth/profile");
}

export async function updateProfile(data: UpdateProfileData) {
  return apiClient("/api/auth/profile", {
    method: "PUT",
    body: data,
  });
}

export async function uploadAvatar(imageUri: string) {
  const formData = new FormData();

  // Obtener el nombre del archivo y extensión
  const filename = imageUri.split("/").pop() || "avatar.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("avatar", {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  return apiClient("/api/auth/profile/avatar", {
    method: "POST",
    body: formData,
  });
}
