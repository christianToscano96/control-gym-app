import { Schema, model, Document } from "mongoose";

export interface IPayment extends Document {
  gym: Schema.Types.ObjectId;
  membership: Schema.Types.ObjectId;
  amount: number;
  date: Date;
  method: string;
  status: "completed" | "pending" | "failed";
}

const PaymentSchema = new Schema<IPayment>(
  {
    gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
