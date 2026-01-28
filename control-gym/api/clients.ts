import { API_BASE_URL } from "@/constants/api";

export async function fetchClients(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener clientes");
  return res.json();
}

export async function fetchClientById(token: string, clientId: string) {
  const res = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener cliente");
  return res.json();
}
