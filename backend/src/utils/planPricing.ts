import { PlatformSettings, IPlatformPlanPrices } from "../models/PlatformSettings";
import { encrypt } from "./crypto";

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

export interface IPlatformEmailConfig {
  gmailUser: string;
  gmailAppPassword: string;
}

export const getPlatformEmailConfig = async (): Promise<IPlatformEmailConfig | null> => {
  const settings = await PlatformSettings.findOne({ key: "global" })
    .select("superadminEmailConfig")
    .lean();

  const emailConfig = settings?.superadminEmailConfig as
    | IPlatformEmailConfig
    | undefined;
  if (!emailConfig?.gmailUser || !emailConfig?.gmailAppPassword) {
    return null;
  }
  return {
    gmailUser: emailConfig.gmailUser,
    gmailAppPassword: emailConfig.gmailAppPassword,
  };
};

export const upsertPlatformEmailConfig = async (
  emailConfig: IPlatformEmailConfig,
): Promise<IPlatformEmailConfig> => {
  const encrypted = {
    gmailUser: emailConfig.gmailUser,
    gmailAppPassword: encrypt(emailConfig.gmailAppPassword),
  };
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: "global" },
    { key: "global", superadminEmailConfig: encrypted },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .select("superadminEmailConfig")
    .lean();

  return {
    gmailUser: settings?.superadminEmailConfig?.gmailUser || emailConfig.gmailUser,
    gmailAppPassword:
      settings?.superadminEmailConfig?.gmailAppPassword ||
      emailConfig.gmailAppPassword,
  };
};
