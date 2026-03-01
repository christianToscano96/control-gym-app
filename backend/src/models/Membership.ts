import { Schema, model, Document } from "mongoose";

export interface IMembership extends Document {
  gymId: Schema.Types.ObjectId;
  plan: "basico" | "pro" | "proplus";
  amount: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

const MembershipSchema = new Schema<IMembership>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    plan: { type: String, enum: ["basico", "pro", "proplus"], required: true },
    amount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Membership = model<IMembership>("Membership", MembershipSchema);
