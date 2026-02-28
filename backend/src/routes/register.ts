import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Gym } from "../models/Gym";
import { Membership } from "../models/Membership";

const router = Router();

// Registro de gimnasio + admin + plan
router.post("/", async (req, res) => {
  try {
    const { gymName, gymAddress, adminName, adminEmail, adminPassword, plan } =
      req.body;
    if (!["basico", "pro", "proplus"].includes(plan)) {
      return res.status(400).json({ message: "Plan inválido" });
    }
    // Validar email único
    const exists = await User.findOne({ email: adminEmail });
    if (exists)
      return res.status(400).json({ message: "El email ya está registrado" });
    // Crear gimnasio
    const gym = await Gym.create({
      name: gymName,
      address: gymAddress,
      plan,
      active: true,
      clientsCount: 0,
    });
    // Crear admin
    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "admin",
      gymId: gym._id,
      active: true,
    });
    gym.owner = admin._id as any;
    await gym.save();
    // Crear membresía inicial (1 mes)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + 1); // 1 mes por defecto
    await Membership.create({
      gymId: gym._id,
      plan,
      startDate: now,
      endDate,
      active: true,
    });
    res
      .status(201)
      .json({ message: "Gimnasio y admin registrados", gymId: gym._id });
  } catch (err) {
    res.status(500).json({ message: "Error en el registro", error: err });
  }
});

export default router;
