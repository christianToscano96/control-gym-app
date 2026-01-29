import { Router } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateJWT, AuthRequest } from "../middleware/auth";

const router = Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });
  const token = jwt.sign(
    { id: user._id, role: user.role, gym: user.gym },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" },
  );
  res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, gym: user.gym },
  });
});

// Obtener perfil del usuario autenticado
router.get("/profile", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener perfil", error: err });
  }
});

// Actualizar perfil del usuario autenticado
router.put("/profile", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { name, phone } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar perfil", error: err });
  }
});

export default router;
