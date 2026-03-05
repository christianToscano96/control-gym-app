import { Schema, model, Document } from "mongoose";

export interface IPlatformPlanPrices {
  basico: number;
  pro: number;
  proplus: number;
}

export interface IPlatformSettings extends Document {
  key: string;
  planPrices: IPlatformPlanPrices;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    planPrices: {
      basico: { type: Number, default: 15000 },
      pro: { type: Number, default: 25000 },
      proplus: { type: Number, default: 40000 },
    },
  },
  { timestamps: true },
);

export const PlatformSettings = model<IPlatformSettings>(
  "PlatformSettings",
  PlatformSettingsSchema,
);
