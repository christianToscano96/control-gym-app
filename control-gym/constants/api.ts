import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 4000;

function getApiBaseUrl(): string {
  // En desarrollo, expo-constants nos da la IP del host automáticamente
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0]; // quita el puerto de Expo (ej: 8081)
    return `http://${host}:${API_PORT}`;
  }

  // Fallback: en Android emulator, localhost apunta al propio emulador,
  // se usa 10.0.2.2 para acceder a la máquina host
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();
