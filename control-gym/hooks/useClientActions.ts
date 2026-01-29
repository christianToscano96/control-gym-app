import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { API_BASE_URL } from "@/constants/api";

interface UseClientActionsReturn {
  deleting: boolean;
  handleDeleteClient: (
    clientName: string,
    clientId: string | string[],
    token: string | undefined,
    onSuccess: () => void,
    onError: (message: string) => void
  ) => void;
}

export const useClientActions = (): UseClientActionsReturn => {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClient = (
    clientName: string,
    clientId: string | string[],
    token: string | undefined,
    onSuccess: () => void,
    onError: (message: string) => void
  ) => {
    Alert.alert(
      "Eliminar Cliente",
      `¿Estás seguro de que deseas eliminar a ${clientName || "este cliente"}? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (!token || !clientId) return;
            setDeleting(true);
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/clients/${clientId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (!res.ok) throw new Error("No se pudo eliminar el cliente");
              onSuccess();
              setTimeout(() => {
                router.back();
              }, 1000);
            } catch (err: any) {
              onError(err.message || "No se pudo eliminar el cliente");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return { deleting, handleDeleteClient };
};
