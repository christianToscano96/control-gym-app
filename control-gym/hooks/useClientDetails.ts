import { useState, useEffect } from "react";
import { fetchClientById } from "@/api/clients";

interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

interface UseClientDetailsReturn {
  clientData: any;
  payments: Payment[];
  loading: boolean;
  error: string;
}

export const useClientDetails = (
  token: string | undefined,
  clientId: string | string[]
): UseClientDetailsReturn => {
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !clientId) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchClientById(token, String(clientId));
        setClientData(data);

        // Mock payment data - replace with actual API call
        setPayments([
          {
            _id: "1",
            amount: 50,
            date: "2026-01-15",
            method: "Efectivo",
            status: "Completado",
          },
          {
            _id: "2",
            amount: 50,
            date: "2025-12-15",
            method: "Transferencia",
            status: "Completado",
          },
          {
            _id: "3",
            amount: 50,
            date: "2025-11-15",
            method: "Efectivo",
            status: "Completado",
          },
        ]);
      } catch (err: any) {
        setError(err.message || "Error al obtener usuario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, token]);

  return { clientData, payments, loading, error };
};
