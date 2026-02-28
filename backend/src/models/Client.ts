import { Schema, model, Document } from "mongoose";

export interface IClient extends Document {
  gymId: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  instagramLink?: string;
  paymentMethod: "transferencia" | "efectivo";
  membershipType?: "basico" | "pro" | "proplus";
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  dni?: string;
  selected_period?: string;
  qrCode?: string;
}

const ClientSchema = new Schema<IClient>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    instagramLink: { type: String },
    paymentMethod: {
      type: String,
      enum: ["transferencia", "efectivo"],
      required: true,
    },
    membershipType: {
      type: String,
      enum: ["basico", "pro", "proplus"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    dni: { type: String },
    selected_period: { type: String },
    qrCode: { type: String },
  },
  { timestamps: true },
);

export const Client = model<IClient>("Client", ClientSchema);
