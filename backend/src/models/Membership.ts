import { Schema, model, Document } from "mongoose";

export interface IMembership extends Document {
  gymId: Schema.Types.ObjectId;
  plan: "basico" | "pro" | "proplus";
  amount: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  paymentReference?: string;
  paymentProofUrl?: string;
  reviewStatus?: "pending" | "approved" | "rejected" | "manual";
  reviewedAt?: Date;
  reviewNotes?: string;
}

const MembershipSchema = new Schema<IMembership>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    plan: { type: String, enum: ["basico", "pro", "proplus"], required: true },
    amount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    paymentReference: { type: String, trim: true },
    paymentProofUrl: { type: String },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "manual"],
      default: "manual",
    },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
  },
  { timestamps: true },
);

export const Membership = model<IMembership>("Membership", MembershipSchema);
