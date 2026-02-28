import { Schema, model, Document } from "mongoose";

export interface IAccessLog extends Document {
  client: Schema.Types.ObjectId;
  gymId: Schema.Types.ObjectId;
  method: string;
  status: "allowed" | "denied";
  denyReason?: string;
  date: Date;
}

const AccessLogSchema = new Schema<IAccessLog>(
  {
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    method: { type: String, required: true }, // QR, NFC, etc.
    status: { type: String, enum: ["allowed", "denied"], default: "allowed" },
    denyReason: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const AccessLog = model<IAccessLog>("AccessLog", AccessLogSchema);
