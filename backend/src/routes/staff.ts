import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

// Crear empleado o entrenador (solo admin)
router.post(
  "/",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const { name, email, password, role } = req.body;
    if (!["empleado", "entrenador"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "El email ya está registrado" });
    const user = await User.create({
      name,
      email,
      password,
      role,
      gym: req.user.gym,
      active: true,
    });
    res.status(201).json(user);
  },
);

// Listar empleados y entrenadores del gimnasio
router.get(
  "/",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const gymId = req.user.gym;
    const staff = await User.find({
      gym: gymId,
      role: { $in: ["empleado", "entrenador"] },
    });
    res.json(staff);
  },
);

export default router;
