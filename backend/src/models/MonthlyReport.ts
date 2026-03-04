import { Schema, model, Document } from "mongoose";

export type MonthlyReportStatus = "completed" | "processing" | "error";

export interface IMonthlyReport extends Document {
  gymId: Schema.Types.ObjectId;
  year: number;
  month: number;
  status: MonthlyReportStatus;
  title: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  sourceSnapshotId?: Schema.Types.ObjectId;
  metrics: {
    revenue: number;
    totalClients: number;
    totalCheckIns: number;
    allowedCheckIns: number;
    deniedCheckIns: number;
    peakHour: {
      hour: number | null;
      label: string;
      count: number;
    };
    dailyAttendancePct: Array<{
      day: number;
      label: string;
      count: number;
      percentage: number;
    }>;
    recommendations: string[];
    newClients: number;
    renewedMemberships: number;
    churnedClients: number;
    averageRevenuePerClient: number;
    membershipDistribution: {
      basico: number;
      pro: number;
      proplus: number;
    };
  };
}

const MonthlyReportSchema = new Schema<IMonthlyReport>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    status: {
      type: String,
      enum: ["completed", "processing", "error"],
      default: "completed",
    },
    title: { type: String, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now },
    sourceSnapshotId: { type: Schema.Types.ObjectId, ref: "MonthlySnapshot" },
    metrics: {
      revenue: { type: Number, default: 0 },
      totalClients: { type: Number, default: 0 },
      totalCheckIns: { type: Number, default: 0 },
      allowedCheckIns: { type: Number, default: 0 },
      deniedCheckIns: { type: Number, default: 0 },
      peakHour: {
        hour: { type: Number, default: null },
        label: { type: String, default: "-" },
        count: { type: Number, default: 0 },
      },
      dailyAttendancePct: [
        {
          day: { type: Number, required: true },
          label: { type: String, required: true },
          count: { type: Number, required: true },
          percentage: { type: Number, required: true },
        },
      ],
      recommendations: [{ type: String }],
      newClients: { type: Number, default: 0 },
      renewedMemberships: { type: Number, default: 0 },
      churnedClients: { type: Number, default: 0 },
      averageRevenuePerClient: { type: Number, default: 0 },
      membershipDistribution: {
        basico: { type: Number, default: 0 },
        pro: { type: Number, default: 0 },
        proplus: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true },
);

MonthlyReportSchema.index({ gymId: 1, year: 1, month: 1 }, { unique: true });

export const MonthlyReport = model<IMonthlyReport>(
  "MonthlyReport",
  MonthlyReportSchema,
);
