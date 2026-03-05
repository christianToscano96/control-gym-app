import { Schema, model, Document } from "mongoose";

export interface IDeletedGymArchive extends Document {
  originalGymId: string;
  gymName: string;
  plan: "basico" | "pro" | "proplus";
  gymCreatedAt: Date;
  deletedAt: Date;
}

const DeletedGymArchiveSchema = new Schema<IDeletedGymArchive>(
  {
    originalGymId: { type: String, required: true, index: true },
    gymName: { type: String, required: true, trim: true },
    plan: {
      type: String,
      enum: ["basico", "pro", "proplus"],
      required: true,
    },
    gymCreatedAt: { type: Date, required: true, index: true },
    deletedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true },
);

export const DeletedGymArchive = model<IDeletedGymArchive>(
  "DeletedGymArchive",
  DeletedGymArchiveSchema,
);
