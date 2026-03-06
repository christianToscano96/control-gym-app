import { Document, Schema, model } from "mongoose";

interface ICashBreakdown {
  cash: number;
  transfer: number;
  card: number;
  other: number;
  total: number;
}

export interface ICashClosure extends Document {
  gymId: Schema.Types.ObjectId;
  dateKey: string;
  businessDate: Date;
  breakdown: ICashBreakdown;
  expectedCash: number;
  countedCash: number;
  difference: number;
  notes?: string;
  closedBy: Schema.Types.ObjectId;
  closedAt: Date;
}

const BreakdownSchema = new Schema<ICashBreakdown>(
  {
    cash: { type: Number, default: 0 },
    transfer: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false },
);

const CashClosureSchema = new Schema<ICashClosure>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    businessDate: { type: Date, required: true },
    breakdown: { type: BreakdownSchema, required: true },
    expectedCash: { type: Number, required: true, default: 0 },
    countedCash: { type: Number, required: true, default: 0 },
    difference: { type: Number, required: true, default: 0 },
    notes: { type: String, trim: true, maxlength: 300 },
    closedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    closedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

CashClosureSchema.index({ gymId: 1, dateKey: 1 }, { unique: true });

export const CashClosure = model<ICashClosure>("CashClosure", CashClosureSchema);
