import { Router } from "express";
import { User } from "../models/User";
import { Gym } from "../models/Gym";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService";

const router = Router();

// Solicitar recuperación de contraseña
router.post("/forgot", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio" });
  }

  try {
    const user = await User.findOne({ email });

    // Siempre responder con éxito por seguridad (no revelar si el email existe)
    if (!user) {
      return res.json({
        message:
          "Si el email está registrado, recibirás un código de recuperación",
      });
    }

    // Generar código numérico de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();
    user.set("resetToken", code);
    user.set("resetTokenExpires", Date.now() + 1000 * 60 * 30); // 30 min
    await user.save();

    // Intentar enviar email real usando la config del gym
    if (user.gym) {
      const gym = await Gym.findById(user.gym);
      if (gym?.emailConfig?.gmailUser && gym?.emailConfig?.gmailAppPassword) {
        await sendPasswordResetEmail({
          toEmail: email,
          userName: user.name,
          gymName: gym.name,
          resetCode: code,
          gmailUser: gym.emailConfig.gmailUser,
          gmailAppPassword: gym.emailConfig.gmailAppPassword,
        });
      } else {
        console.log(
          `[Password Reset] Gym sin email configurado. Código para ${email}: ${code}`,
        );
      }
    } else {
      console.log(
        `[Password Reset] Usuario sin gym. Código para ${email}: ${code}`,
      );
    }

    res.json({
      message:
        "Si el email está registrado, recibirás un código de recuperación",
    });
  } catch (error) {
    console.error("[Password Reset] Error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Cambiar contraseña usando código
router.post("/reset", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, código y nueva contraseña son obligatorios" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const user = await User.findOne({ email, resetToken: code });

    if (!user) {
      return res.status(400).json({ message: "Código inválido" });
    }

    if (user.get("resetTokenExpires") < Date.now()) {
      return res
        .status(400)
        .json({ message: "El código ha expirado. Solicita uno nuevo" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.set("resetToken", undefined);
    user.set("resetTokenExpires", undefined);
    await user.save();

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("[Password Reset] Error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
