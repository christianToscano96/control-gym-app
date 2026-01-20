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

export default router;
