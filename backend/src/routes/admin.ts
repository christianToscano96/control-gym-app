import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { Gym } from "../models/Gym";
import { Membership } from "../models/Membership";

const router = Router();

// Ver membresía y plan actual del gimnasio del admin
router.get(
  "/membership",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const gymId = req.user.gym;
    const gym = await Gym.findById(gymId);
    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });
    const membership = await Membership.findOne({ gym: gymId, active: true });
    res.json({
      plan: gym.plan,
      membership,
    });
  },
);

// Obtener configuración de email del gimnasio
router.get(
  "/email-config",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const gym = await Gym.findById(req.user.gym);
    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });

    res.json({
      gmailUser: gym.emailConfig?.gmailUser || "",
      isConfigured: !!(
        gym.emailConfig?.gmailUser && gym.emailConfig?.gmailAppPassword
      ),
    });
  },
);

// Actualizar configuración de email del gimnasio
router.put(
  "/email-config",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const { gmailUser, gmailAppPassword } = req.body;

    if (!gmailUser || !gmailAppPassword) {
      return res
        .status(400)
        .json({ message: "Gmail y App Password son requeridos" });
    }

    const gym = await Gym.findByIdAndUpdate(
      req.user.gym,
      { emailConfig: { gmailUser, gmailAppPassword } },
      { new: true },
    );

    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });

    res.json({
      message: "Configuración de email actualizada",
      gmailUser: gym.emailConfig?.gmailUser,
      isConfigured: true,
    });
  },
);

export default router;
