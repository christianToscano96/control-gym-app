import { Router } from "express";
import { authenticateJWT, requireAdmin, requireRole, AuthRequest } from "../middleware/auth";
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
    if (!client)
      return res
        .status(404)
        .json({ message: "Cliente no encontrado" });

    // Verificar y persistir expiración si el endDate ya pasó
    if (client.isActive && client.endDate && new Date(client.endDate) < new Date()) {
      client.isActive = false;
      await client.save();
    }

    if (!client.isActive)
      return res
        .status(404)
        .json({ message: "Cliente no encontrado o inactivo" });
    const log = await AccessLog.create({
      client: client._id,
      gymId: req.user.gymId,
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
      gymId: req.user.gymId,
    })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  },
);

// Obtener accesos recientes del gimnasio (para dashboard)
router.get(
  "/recent",
  authenticateJWT,
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = req.user.gymId;
      const logs = await AccessLog.find({ gymId })
        .sort({ date: -1 })
        .limit(10)
        .populate("client", "firstName lastName membershipType");

      const recentCheckIns = logs
        .filter((log: any) => log.client)
        .map((log: any) => ({
          _id: log._id,
          clientName: `${log.client.firstName} ${log.client.lastName}`,
          membershipType: log.client.membershipType,
          method: log.method,
          date: log.date,
        }));

      res.json(recentCheckIns);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener accesos recientes" });
    }
  },
);

// Validar acceso por QR
router.post(
  "/validate-qr",
  authenticateJWT,
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    const { clientId } = req.body;
    const gymId = req.user.gymId;

    if (!clientId) {
      return res.status(400).json({
        allowed: false,
        message: "ID de cliente no proporcionado",
      });
    }

    try {
      const client = await Client.findOne({ _id: clientId, gymId });

      if (!client) {
        return res.status(404).json({
          allowed: false,
          message: "Cliente no encontrado en este gimnasio",
        });
      }

      const clientInfo = {
        clientName: `${client.firstName} ${client.lastName}`,
        membershipType: client.membershipType,
        email: client.email,
        phone: client.phone,
        startDate: client.startDate,
        endDate: client.endDate,
      };

      if (!client.isActive) {
        return res.status(200).json({
          allowed: false,
          ...clientInfo,
          message: "Membresía inactiva",
        });
      }

      if (client.endDate && new Date(client.endDate) < new Date()) {
        // Persistir el cambio de estado
        if (client.isActive) {
          client.isActive = false;
          await client.save();
        }
        return res.status(200).json({
          allowed: false,
          ...clientInfo,
          message: "Membresía expirada",
        });
      }

      await AccessLog.create({
        client: client._id,
        gymId,
        method: "QR",
      });

      return res.status(200).json({
        allowed: true,
        ...clientInfo,
        message: "Acceso permitido",
      });
    } catch (err) {
      return res.status(500).json({
        allowed: false,
        message: "Error al validar acceso",
      });
    }
  },
);

export default router;
