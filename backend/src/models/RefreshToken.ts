import { Schema, model, Document } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  userId: Schema.Types.ObjectId;
  expiresAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export const RefreshToken = model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
