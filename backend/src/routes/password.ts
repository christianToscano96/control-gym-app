import { Router } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = Router();

// Simulación de envío de email (console.log)
function sendEmail(to: string, subject: string, text: string) {
  console.log(`Email enviado a ${to}: ${subject} - ${text}`);
}

// Solicitar recuperación de contraseña
router.post("/forgot", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  // Generar token temporal
  const token = crypto.randomBytes(32).toString("hex");
  user.set("resetToken", token);
  user.set("resetTokenExpires", Date.now() + 1000 * 60 * 30); // 30 min
  await user.save();
  sendEmail(
    email,
    "Recuperación de contraseña",
    `Tu token de recuperación es: ${token}`,
  );
  res.json({ message: "Token de recuperación enviado al email" });
});

// Cambiar contraseña usando token
router.post("/reset", async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email, resetToken: token });
  if (!user || user.get("resetTokenExpires") < Date.now()) {
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: "Contraseña inválida" });
  user.password = await bcrypt.hash(newPassword, 10);
  user.set("resetToken", undefined);
  user.set("resetTokenExpires", undefined);
  await user.save();
  res.json({ message: "Contraseña cambiada correctamente" });
});

export default router;
