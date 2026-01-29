import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "superadmin" | "empleado" | "entrenador";
  gym?: Schema.Types.ObjectId;
  active: boolean;
  phone?: string;
  avatar?: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "superadmin", "empleado", "entrenador"],
      required: true,
    },
    gym: { type: Schema.Types.ObjectId, ref: "Gym" },
    active: { type: Boolean, default: true },
    phone: { type: String },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Number },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);
