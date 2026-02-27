import { apiClient } from "./client";

export interface PeriodPricingData {
  "1 dia": number;
  "7 dias": number;
  "15 dias": number;
  mensual: number;
}

export interface PeriodPricingResponse {
  periodPricing: PeriodPricingData;
}

export async function fetchPeriodPricing(): Promise<PeriodPricingResponse> {
  return apiClient<PeriodPricingResponse>("/api/admin/period-pricing");
}

export async function updatePeriodPricing(
  data: PeriodPricingData,
): Promise<PeriodPricingResponse & { message: string }> {
  return apiClient("/api/admin/period-pricing", {
    method: "PUT",
    body: { periodPricing: data },
  });
}
