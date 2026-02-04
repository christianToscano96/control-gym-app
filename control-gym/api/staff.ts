import { API_BASE_URL } from "@/constants/api";

export interface StaffData {
  name: string;
  email: string;
  password?: string;
  // Solo empleado por ahora, entrenador para futura implementación
  role: "empleado"; // | "entrenador";
  phone?: string;
  avatar?: string;
  active?: boolean;
}

export interface StaffResponse {
  _id: string;
  name: string;
  email: string;
  // Solo empleado por ahora, entrenador para futura implementación
  role: "empleado"; // | "entrenador";
  phone?: string;
  avatar?: string;
  active: boolean;
  gym: string;
  createdAt: string;
  updatedAt: string;
}

// Crear nuevo staff
export async function createStaff(token: string, formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/api/staff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al crear staff");
  }

  return data;
}

// Obtener todos los staff
export async function fetchStaff(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/staff`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener staff");
  }

  return res.json();
}

// Obtener un staff por ID
export async function fetchStaffById(token: string, staffId: string) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener staff");
  }

  return res.json();
}

// Actualizar staff
export async function updateStaff(
  token: string,
  staffId: string,
  formData: FormData,
) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar staff");
  }

  return data;
}

// Cambiar contraseña del staff
export async function updateStaffPassword(
  token: string,
  staffId: string,
  password: string,
) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${staffId}/password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al cambiar contraseña");
  }

  return data;
}

// Activar/desactivar staff
export async function toggleStaffStatus(token: string, staffId: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/staff/${staffId}/toggle-status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al cambiar estado");
  }

  return data;
}

// Eliminar staff
export async function deleteStaff(token: string, staffId: string) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al eliminar staff");
  }

  return data;
}

// Buscar staff
export async function searchStaff(token: string, query: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/staff/search/${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Error al buscar staff");
  }

  return res.json();
}
