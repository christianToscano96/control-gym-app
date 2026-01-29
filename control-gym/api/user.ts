import { API_BASE_URL } from "@/constants/api";

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener perfil");
  return res.json();
}

export async function updateProfile(token: string, data: UpdateProfileData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al actualizar perfil");
  }

  return res.json();
}

export async function uploadAvatar(token: string, imageUri: string) {
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

  const res = await fetch(`${API_BASE_URL}/api/auth/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al subir avatar");
  }

  return res.json();
}
