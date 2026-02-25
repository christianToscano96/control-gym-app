import { Schema, model, Document } from "mongoose";

export interface IEmailConfig {
  gmailUser: string;
  gmailAppPassword: string;
}

export interface IGym extends Document {
  name: string;
  address: string;
  owner?: Schema.Types.ObjectId | string;
  plan: "basico" | "pro" | "proplus";
  active: boolean;
  clientsCount: number;
  emailConfig?: IEmailConfig;
}

const GymSchema = new Schema<IGym>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    plan: { type: String, enum: ["basico", "pro", "proplus"], required: true },
    active: { type: Boolean, default: true },
    clientsCount: { type: Number, default: 0 },
    emailConfig: {
      gmailUser: { type: String },
      gmailAppPassword: { type: String },
    },
  },
  { timestamps: true },
);

export const Gym = model<IGym>("Gym", GymSchema);
