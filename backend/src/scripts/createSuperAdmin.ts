import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gym-saas";

async function createSuperAdmin() {
  await mongoose.connect(MONGO_URI);
  const hashed = await bcrypt.hash("superadmin123", 10);
  const superadmin = await User.create({
    name: "Super Admin",
    email: "supergym@gmail.com",
    password: hashed,
    role: "superadmin",
    active: true,
  });
  console.log("Superadmin creado:", {
    email: superadmin.email,
    password: "superadmin123",
  });
  await mongoose.disconnect();
}

createSuperAdmin();
