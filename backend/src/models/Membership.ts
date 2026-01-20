import { Schema, model, Document } from "mongoose";

export interface IMembership extends Document {
  gym: Schema.Types.ObjectId;
  plan: "basico" | "pro" | "proplus";
  startDate: Date;
  endDate: Date;
  active: boolean;
}

const MembershipSchema = new Schema<IMembership>(
  {
    gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    plan: { type: String, enum: ["basico", "pro", "proplus"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Membership = model<IMembership>("Membership", MembershipSchema);
