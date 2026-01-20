import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { AccessLog } from "../models/AccessLog";
import { Client } from "../models/Client";

const router = Router();

// Registrar acceso de cliente (QR/NFC)
router.post(
  "/register",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const { clientId, method } = req.body;
    const client = await Client.findById(clientId);
    if (!client || !client.active)
      return res
        .status(404)
        .json({ message: "Cliente no encontrado o inactivo" });
    const log = await AccessLog.create({
      client: client._id,
      gym: req.user.gym,
      method,
    });
    res.status(201).json({ message: "Acceso registrado", log });
  },
);

// Consultar historial de accesos de un cliente
router.get(
  "/history/:clientId",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const logs = await AccessLog.find({
      client: req.params.clientId,
      gym: req.user.gym,
    })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  },
);

export default router;
