import { apiClient } from "./client";

export interface CashBreakdown {
  cash: number;
  transfer: number;
  card: number;
  other: number;
  total: number;
}

export interface TodayCashSummary {
  dateKey: string;
  status: "open" | "closed";
  paymentCount: number;
  expectedCash: number;
  breakdown: CashBreakdown;
  closure: {
    id: string;
    countedCash: number;
    difference: number;
    notes?: string;
    closedAt: string;
    closedBy?: {
      _id?: string;
      name?: string;
      email?: string;
    };
  } | null;
}

export interface CashClosureRecord {
  _id: string;
  dateKey: string;
  expectedCash: number;
  countedCash: number;
  difference: number;
  notes?: string;
  closedAt: string;
  breakdown: CashBreakdown;
  closedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
}

export async function getTodayCashSummary() {
  return apiClient<TodayCashSummary>("/api/cash-closure/today");
}

export async function closeCashRegister(payload: {
  countedCash: number;
  notes?: string;
}) {
  return apiClient<{ message: string; closure: CashClosureRecord }>(
    "/api/cash-closure/close",
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function getCashClosureHistory(limit = 10) {
  return apiClient<CashClosureRecord[]>(`/api/cash-closure/history?limit=${limit}`);
}
