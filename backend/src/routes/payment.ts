import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { Payment } from "../models/Payment";
import { Membership } from "../models/Membership";

const router = Router();

// Registrar pago y renovar membresía
import { AuditLog } from "../models/AuditLog";

// Procesar pago simulado y activar membresía
router.post(
  "/process",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const { membershipId, amount, method } = req.body;
    const membership = await Membership.findById(membershipId);
    if (!membership || !membership.active)
      return res
        .status(404)
        .json({ message: "Membresía activa no encontrada" });

    // Simular procesamiento de pago
    const paymentStatus = "completed"; // Aquí iría integración real con Stripe, MercadoPago, etc.
    const payment = await Payment.create({
      gym: membership.gym,
      membership: membership._id,
      amount,
      method,
      status: paymentStatus,
    });

    // Activar membresía automáticamente si el pago fue exitoso
    if (paymentStatus === "completed") {
      membership.endDate = new Date(
        new Date(membership.endDate).setMonth(
          new Date(membership.endDate).getMonth() + 1,
        ),
      );
      await membership.save();
    }

    // Registrar log de pago en auditoría
    await AuditLog.create({
      user: req.user.id,
      role: req.user.role,
      action: "Pago procesado",
      details: {
        paymentId: payment._id,
        membershipId: membership._id,
        amount,
        method,
      },
    });

    res.json({ message: "Pago procesado y membresía actualizada", payment });
  },
);

// Ver historial de pagos y membresías del gimnasio
router.get(
  "/history",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const gymId = req.user.gym;
    const payments = await Payment.find({ gym: gymId }).populate("membership");
    const memberships = await Membership.find({ gym: gymId });
    res.json({ payments, memberships });
  },
);

export default router;
