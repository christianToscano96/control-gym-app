import { Schema, model, Document } from "mongoose";

export interface IClient extends Document {
  gym: Schema.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  membershipType: "basico" | "pro" | "proplus";
  active: boolean;
  startDate: Date;
  endDate?: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    membershipType: {
      type: String,
      enum: ["basico", "pro", "proplus"],
      required: true,
    },
    active: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true },
);

export const Client = model<IClient>("Client", ClientSchema);
