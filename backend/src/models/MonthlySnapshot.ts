import { Schema, model, Document } from "mongoose";

export interface IMonthlySnapshot extends Document {
  gymId: Schema.Types.ObjectId;
  year: number;
  month: number;
  revenue: number;
  totalClients: number;
  totalCheckIns: number;
  newClients: number;
  membershipDistribution: {
    basico: number;
    pro: number;
    proplus: number;
  };
  averageRevenuePerClient: number;
  churnedClients: number;
}

const MonthlySnapshotSchema = new Schema<IMonthlySnapshot>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    revenue: { type: Number, default: 0 },
    totalClients: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    newClients: { type: Number, default: 0 },
    membershipDistribution: {
      basico: { type: Number, default: 0 },
      pro: { type: Number, default: 0 },
      proplus: { type: Number, default: 0 },
    },
    averageRevenuePerClient: { type: Number, default: 0 },
    churnedClients: { type: Number, default: 0 },
  },
  { timestamps: true },
);

MonthlySnapshotSchema.index({ gymId: 1, year: 1, month: 1 }, { unique: true });

export const MonthlySnapshot = model<IMonthlySnapshot>(
  "MonthlySnapshot",
  MonthlySnapshotSchema,
);
