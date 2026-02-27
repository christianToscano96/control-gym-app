import { Schema, model, Document } from "mongoose";

export interface IPayment extends Document {
  gym: Schema.Types.ObjectId;
  membership?: Schema.Types.ObjectId;
  client?: Schema.Types.ObjectId;
  amount: number;
  date: Date;
  method: string;
  period?: string;
  status: "completed" | "pending" | "failed";
}

const PaymentSchema = new Schema<IPayment>(
  {
    gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: false,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, required: true },
    period: { type: String },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
