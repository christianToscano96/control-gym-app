import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Gym } from "../models/Gym";
import { Membership } from "../models/Membership";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gym-saas";

async function createTestAdmins() {
  await mongoose.connect(MONGO_URI);

  // Admin 1: sin membresía
  const gym1 = await Gym.create({
    name: "Gimnasio Sin Membresía",
    address: "Calle Uno 111",
    owner: null,
    plan: "basico",
    active: true,
    clientsCount: 0,
  });
  const hashed1 = await bcrypt.hash("admin123", 10);
  const admin1 = await User.create({
    name: "Admin Sin Membresía",
    email: "admin1@gym.com",
    password: hashed1,
    role: "admin",
    gymId: gym1._id,
    active: true,
  });
  gym1.owner = admin1._id.toString();
  await gym1.save();

  // Admin 2: con membresía activa
  const gym2 = await Gym.create({
    name: "Gimnasio Con Membresía",
    address: "Calle Dos 222",
    owner: null,
    plan: "pro",
    active: true,
    clientsCount: 0,
  });
  const hashed2 = await bcrypt.hash("admin123", 10);
  const admin2 = await User.create({
    name: "Admin Con Membresía",
    email: "admin2@gym.com",
    password: hashed2,
    role: "admin",
    gymId: gym2._id,
    active: true,
  });
  gym2.owner = admin2._id.toString();
  await gym2.save();

  // Membresía activa para admin2
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  await Membership.create({
    gymId: gym2._id,
    plan: "pro",
    startDate: now,
    endDate: end,
    active: true,
  });

  console.log("Admins de prueba creados:");
  console.log("Admin 1 (sin membresía):", { email: admin1.email, password: "admin123" });
  console.log("Admin 2 (con membresía):", { email: admin2.email, password: "admin123" });
  await mongoose.disconnect();
}

createTestAdmins();
