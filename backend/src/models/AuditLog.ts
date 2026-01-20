import { Schema, model, Document } from "mongoose";

export interface IAuditLog extends Document {
  user: Schema.Types.ObjectId;
  role: string;
  action: string;
  details?: any;
  date: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
