import { Schema, model, Document } from "mongoose";

export interface IGym extends Document {
  name: string;
  address: string;
  owner?: Schema.Types.ObjectId | string;
  plan: "basico" | "pro" | "proplus";
  active: boolean;
  clientsCount: number;
}

const GymSchema = new Schema<IGym>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    plan: { type: String, enum: ["basico", "pro", "proplus"], required: true },
    active: { type: Boolean, default: true },
    clientsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Gym = model<IGym>("Gym", GymSchema);
