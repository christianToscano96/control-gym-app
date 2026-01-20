import { Router } from "express";
import { authenticateJWT, requireAdmin, requireSuperAdmin, AuthRequest } from "../middleware/auth";
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

// Obtener todas las membresías (admin: solo su gym, superadmin: todas)
router.get(
  "/",
  authenticateJWT,
  requireSuperAdmin,
  async (req: AuthRequest, res) => {
    try {
      let memberships;
      if (req.user.role === "superadmin") {
        memberships = await Membership.find().populate("gym");
      } else {
        memberships = await Membership.find({ gym: req.user.gym });
      }
      res.json(memberships);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener membresías", error: err });
    }
  },
);

// Crear membresía (admin: solo su gym, superadmin: cualquier gym)
router.post(
  "/",
  authenticateJWT,
  requireSuperAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { gym, plan, startDate, endDate, active } = req.body;
      const gymId = req.user.role === "superadmin" ? gym : req.user.gym;
      const membership = new Membership({ gym: gymId, plan, startDate, endDate, active });
      await membership.save();
      res.status(201).json(membership);
    } catch (err) {
      res.status(500).json({ message: "Error al crear membresía", error: err });
    }
  },
);

// Editar membresía
router.put(
  "/:id",
  authenticateJWT,
  requireSuperAdmin,
  async (req: AuthRequest, res) => {
    try {
      const filter = req.user.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, gym: req.user.gym };
      const membership = await Membership.findOneAndUpdate(filter, req.body, { new: true });
      if (!membership) return res.status(404).json({ message: "Membresía no encontrada" });
      res.json(membership);
    } catch (err) {
      res.status(500).json({ message: "Error al editar membresía", error: err });
    }
  },
);

// Eliminar membresía
router.delete(
  "/:id",
  authenticateJWT,
  requireSuperAdmin,
  async (req: AuthRequest, res) => {
    try {
      const filter = req.user.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, gym: req.user.gym };
      const membership = await Membership.findOneAndDelete(filter);
      if (!membership) return res.status(404).json({ message: "Membresía no encontrada" });
      res.json({ message: "Membresía eliminada" });
    } catch (err) {
      res.status(500).json({ message: "Error al eliminar membresía", error: err });
    }
  },
);

export default router;
