import { apiClient } from "./client";
import { PlanPrices } from "./superadmin";

export async function fetchPublicPlanPrices(): Promise<PlanPrices> {
  const data = await apiClient<{ planPrices: PlanPrices }>(
    "/api/register/plan-prices",
    { skipAuth: true },
  );
  return data.planPrices;
}
