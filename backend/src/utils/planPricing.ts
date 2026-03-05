import { PlatformSettings, IPlatformPlanPrices } from "../models/PlatformSettings";

export const DEFAULT_PLAN_PRICES: IPlatformPlanPrices = {
  basico: 15000,
  pro: 25000,
  proplus: 40000,
};

export const normalizePlanPrices = (
  prices?: Partial<IPlatformPlanPrices>,
): IPlatformPlanPrices => ({
  basico:
    typeof prices?.basico === "number" && prices.basico >= 0
      ? prices.basico
      : DEFAULT_PLAN_PRICES.basico,
  pro:
    typeof prices?.pro === "number" && prices.pro >= 0
      ? prices.pro
      : DEFAULT_PLAN_PRICES.pro,
  proplus:
    typeof prices?.proplus === "number" && prices.proplus >= 0
      ? prices.proplus
      : DEFAULT_PLAN_PRICES.proplus,
});

export const getPlatformPlanPrices = async (): Promise<IPlatformPlanPrices> => {
  const settings = await PlatformSettings.findOne({ key: "global" })
    .select("planPrices")
    .lean();
  return normalizePlanPrices(settings?.planPrices as Partial<IPlatformPlanPrices>);
};

export const upsertPlatformPlanPrices = async (
  planPrices: Partial<IPlatformPlanPrices>,
): Promise<IPlatformPlanPrices> => {
  const normalized = normalizePlanPrices(planPrices);
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: "global" },
    { key: "global", planPrices: normalized },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .select("planPrices")
    .lean();
  return normalizePlanPrices(settings?.planPrices as Partial<IPlatformPlanPrices>);
};
