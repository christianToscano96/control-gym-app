import { apiClient } from "./client";

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
  gymId: string;
  createdAt: string;
  updatedAt: string;
}

// Crear nuevo staff
export async function createStaff(formData: FormData) {
  return apiClient("/api/staff", {
    method: "POST",
    body: formData,
  });
}

// Obtener todos los staff
export async function fetchStaff() {
  return apiClient("/api/staff");
}

// Obtener un staff por ID
export async function fetchStaffById(staffId: string) {
  return apiClient(`/api/staff/${staffId}`);
}

// Actualizar staff
export async function updateStaff(staffId: string, formData: FormData) {
  return apiClient(`/api/staff/${staffId}`, {
    method: "PUT",
    body: formData,
  });
}

// Cambiar contraseña del staff
export async function updateStaffPassword(staffId: string, password: string) {
  return apiClient(`/api/staff/${staffId}/password`, {
    method: "PATCH",
    body: { password },
  });
}

// Activar/desactivar staff
export async function toggleStaffStatus(staffId: string) {
  return apiClient(`/api/staff/${staffId}/toggle-status`, {
    method: "PATCH",
  });
}

// Eliminar staff
export async function deleteStaff(staffId: string) {
  return apiClient(`/api/staff/${staffId}`, {
    method: "DELETE",
  });
}

// Buscar staff
export async function searchStaff(query: string) {
  return apiClient(`/api/staff/search/${encodeURIComponent(query)}`);
}
