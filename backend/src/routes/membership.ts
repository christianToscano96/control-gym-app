import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { Gym } from "../models/Gym";
import { Membership } from "../models/Membership";

const router = Router();

// Cambiar plan (upgrade/downgrade) - solo admin de su gimnasio
router.post(
  "/change-plan",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { newPlan } = req.body;
      if (!["basico", "pro", "proplus"].includes(newPlan)) {
        return res.status(400).json({ message: "Plan inválido" });
      }
      const gym = await Gym.findById(req.user.gym);
      if (!gym)
        return res.status(404).json({ message: "Gimnasio no encontrado" });
      // Finalizar membresía anterior
      await Membership.updateMany(
        { gym: gym._id, active: true },
        { active: false, endDate: new Date() },
      );
      // Crear nueva membresía (1 mes)
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + 1);
      await Membership.create({
        gym: gym._id,
        plan: newPlan,
        startDate: now,
        endDate,
        active: true,
      });
      // Actualizar plan en el gimnasio
      gym.plan = newPlan;
      await gym.save();
      res.json({ message: "Plan actualizado correctamente" });
    } catch (err) {
      res.status(500).json({ message: "Error al cambiar de plan", error: err });
    }
  },
);

export default router;
