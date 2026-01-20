import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Gym } from "../models/Gym";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gym-saas";

async function createFakeAdmin() {
  await mongoose.connect(MONGO_URI);
  const gym = await Gym.create({
    name: "Gimnasio Ficticio",
    address: "Calle Falsa 123",
    owner: null, // Se asigna después
    plan: "basico",
    active: true,
    clientsCount: 0,
  });
  const hashed = await bcrypt.hash("admin123", 10);
  const admin = await User.create({
    name: "Admin Ficticio",
    email: "admin@gym.com",
    password: hashed,
    role: "admin",
    gym: gym._id,
    active: true,
  });
  gym.owner = admin._id.toString();
  await gym.save();
  console.log("Admin y gimnasio ficticio creados:", {
    email: admin.email,
    password: "admin123",
  });
  await mongoose.disconnect();
}

createFakeAdmin();
