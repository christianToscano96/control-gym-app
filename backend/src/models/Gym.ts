import { Schema, model, Document } from "mongoose";

export interface IEmailConfig {
  gmailUser: string;
  gmailAppPassword: string;
}

export interface IPeriodPricing {
  "1 dia": number;
  "7 dias": number;
  "15 dias": number;
  mensual: number;
}

export interface IGym extends Document {
  name: string;
  address: string;
  owner?: Schema.Types.ObjectId | string;
  plan: "basico" | "pro" | "proplus";
  active: boolean;
  onboardingStatus: "pending" | "approved" | "rejected";
  paymentReference?: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: Date;
  paymentReviewedAt?: Date;
  paymentReviewedBy?: Schema.Types.ObjectId | string;
  paymentRejectionReason?: string;
  clientsCount: number;
  emailConfig?: IEmailConfig;
  periodPricing?: IPeriodPricing;
}

const GymSchema = new Schema<IGym>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    plan: { type: String, enum: ["basico", "pro", "proplus"], required: true },
    active: { type: Boolean, default: true },
    onboardingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    paymentProofUrl: { type: String },
    paymentProofUploadedAt: { type: Date },
    paymentReviewedAt: { type: Date },
    paymentReviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    paymentRejectionReason: { type: String },
    clientsCount: { type: Number, default: 0 },
    emailConfig: {
      gmailUser: { type: String },
      gmailAppPassword: { type: String },
    },
    periodPricing: {
      "1 dia": { type: Number, default: 0 },
      "7 dias": { type: Number, default: 0 },
      "15 dias": { type: Number, default: 0 },
      mensual: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const Gym = model<IGym>("Gym", GymSchema);
