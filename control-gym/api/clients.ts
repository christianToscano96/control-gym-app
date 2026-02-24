import { apiClient } from "./client";

export async function fetchClients() {
  return apiClient("/api/clients");
}

export async function fetchClientById(clientId: string) {
  return apiClient(`/api/clients/${clientId}`);
}
