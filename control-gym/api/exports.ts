import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { API_BASE_URL } from "@/constants/api";
import { useUserStore } from "@/stores/store";

async function downloadAndShare(endpoint: string, filename: string) {
  const token = useUserStore.getState().user?.token;
  const url = `${API_BASE_URL}${endpoint}`;

  // Fetch con headers de auth
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Error al descargar (${response.status})`);
  }

  const csvText = await response.text();

  // Escribir en archivo usando la nueva API de expo-file-system
  const file = new File(Paths.cache, filename);
  file.text = csvText;

  // Compartir
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      dialogTitle: `Exportar ${filename}`,
    });
  }
}

export async function exportClientsCSV() {
  return downloadAndShare("/api/export/clients/csv", "clientes.csv");
}

export async function exportPaymentsCSV() {
  return downloadAndShare("/api/export/payments/csv", "pagos.csv");
}

export async function exportAttendanceCSV() {
  return downloadAndShare("/api/export/attendance/csv", "asistencias.csv");
}
