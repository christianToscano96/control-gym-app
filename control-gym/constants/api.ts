import Constants from "expo-constants";

const API_PORT = 4000;

function getApiBaseUrl(): string {
  // En desarrollo, expo-constants nos da la IP del host automáticamente
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0]; // quita el puerto de Expo (ej: 8081)
    return `http://${host}:${API_PORT}`;
  }

  // Fallback para producción o si no se detecta el host
  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();
