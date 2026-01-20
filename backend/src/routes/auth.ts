import { Router } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

export default router;
