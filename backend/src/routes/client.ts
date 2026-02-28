import { Router } from "express";
import { Client } from "../models/Client";
import {
  authenticateJWT,
  requireAdmin,
  requireRole,
  AuthRequest,
} from "../middleware/auth";
import { sendWelcomeEmail } from "../services/emailService";
import QRCode from "qrcode";
import { calculateEndDate } from "../utils/membershipUtils";
import { expireClientsForGym } from "../utils/expireClients";
import { Payment } from "../models/Payment";

const router = Router();

// Todas las rutas usan autenticación JWT
router.use(authenticateJWT);

// Obtener todos los clientes del gimnasio (admin, superadmin y empleado)
router.get(
  "/",
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    const gymId = req.user.gymId;

    // Expirar clientes cuyo endDate ya pasó antes de devolver resultados
    await expireClientsForGym(gymId);

    const clients = await Client.find({ gymId });
    res.json(clients);
  },
);

// Crear cliente en el gimnasio del admin
import { Gym } from "../models/Gym";

router.post("/", requireAdmin, async (req: AuthRequest, res) => {
  const gymId = req.user.gymId;
  // Obtener el gimnasio y su plan
  const gym = await Gym.findById(gymId);
  if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });

  // Definir límites según plan
  const planLimits: Record<string, number> = {
    basico: 100,
    pro: 500,
    proplus: Infinity,
  };
  const maxClients = planLimits[gym.plan] ?? 0;

  // Contar clientes activos
  const currentClients = await Client.countDocuments({
    gymId,
    isActive: true,
  });
  if (currentClients >= maxClients) {
    return res.status(403).json({
      message: `Límite de clientes alcanzado para el plan ${gym.plan}`,
    });
  }

  const client = new Client({ ...req.body, gymId });

  // Calcular endDate basado en startDate + selected_period
  if (client.startDate && client.selected_period) {
    client.endDate = calculateEndDate(client.startDate, client.selected_period);
  }

  await client.save();

  // Generar QR Code con el ID del cliente
  try {
    const qrDataUrl = await QRCode.toDataURL(String(client._id), {
      width: 300,
      margin: 2,
      color: { dark: "#111827", light: "#ffffff" },
    });
    client.qrCode = qrDataUrl;
    await client.save();
  } catch (qrErr) {
    console.error("Error generando QR code:", qrErr);
  }

  // Crear registro de pago si hay precio configurado
  if (client.selected_period) {
    const periodKey = client.selected_period.toLowerCase();
    const configuredPrice =
      gym.periodPricing?.[periodKey as keyof typeof gym.periodPricing] || 0;
    const amount = req.body.paymentAmount || configuredPrice;

    if (amount > 0) {
      await Payment.create({
        gymId,
        client: client._id,
        amount,
        method: client.paymentMethod,
        period: client.selected_period,
        status: "completed",
        date: new Date(),
      });
    }
  }

  // Actualizar contador de clientes
  gym.clientsCount = currentClients + 1;
  await gym.save();

  // Enviar email de bienvenida (fire-and-forget)
  if (gym.emailConfig?.gmailUser && gym.emailConfig?.gmailAppPassword) {
    sendWelcomeEmail({
      clientEmail: client.email,
      clientName: `${client.firstName} ${client.lastName}`,
      gymName: gym.name,
      membershipType: client.membershipType || "basico",
      startDate: client.startDate,
      endDate: client.endDate,
      gmailUser: gym.emailConfig.gmailUser,
      gmailAppPassword: gym.emailConfig.gmailAppPassword,
      qrCodeDataUrl: client.qrCode,
    }).catch((err) =>
      console.error("Error enviando email de bienvenida:", err),
    );
  } else {
    console.warn("Email no enviado: el gimnasio no tiene email configurado");
  }

  res.status(201).json(client);
});

// Editar cliente (solo si pertenece al gimnasio - admin, superadmin y empleado)
router.put(
  "/:id",
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    const gymId = req.user.gymId;
    const updateData = { ...req.body };

    // Si cambia startDate o selected_period, recalcular endDate
    if (updateData.startDate || updateData.selected_period) {
      const existing = await Client.findOne({
        _id: req.params.id,
        gymId,
      });
      if (!existing)
        return res.status(404).json({ message: "Cliente no encontrado" });

      const startDate = new Date(updateData.startDate || existing.startDate);
      const period = updateData.selected_period || existing.selected_period;
      if (period) {
        updateData.endDate = calculateEndDate(startDate, period);
      }
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, gymId },
      updateData,
      { new: true },
    );
    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  },
);

// Renovar membresía de un cliente (admin, superadmin y empleado)
router.put(
  "/:id/renew",
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    const gymId = req.user.gymId;
    const { startDate, selected_period, paymentMethod, paymentAmount } =
      req.body;

    if (!startDate || !selected_period || !paymentMethod) {
      return res.status(400).json({
        message: "startDate, selected_period y paymentMethod son obligatorios",
      });
    }

    const client = await Client.findOne({ _id: req.params.id, gymId });
    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });

    // Actualizar datos de membresía
    client.startDate = new Date(startDate);
    client.selected_period = selected_period;
    client.paymentMethod = paymentMethod;
    client.isActive = true;
    client.endDate = calculateEndDate(client.startDate, selected_period);

    await client.save();

    // Crear registro de pago
    const gym = await Gym.findById(gymId);
    const periodKey = selected_period.toLowerCase();
    const configuredPrice =
      gym?.periodPricing?.[periodKey as keyof typeof gym.periodPricing] || 0;
    const amount = paymentAmount || configuredPrice;

    if (amount > 0) {
      await Payment.create({
        gymId,
        client: client._id,
        amount,
        method: paymentMethod,
        period: selected_period,
        status: "completed",
        date: new Date(),
      });
    }

    res.json(client);
  },
);

// Eliminar cliente (solo admin y superadmin)
router.delete("/:id", requireAdmin, async (req: AuthRequest, res) => {
  const gymId = req.user.gymId;
  const client = await Client.findOneAndDelete({
    _id: req.params.id,
    gymId,
  });
  if (!client)
    return res.status(404).json({ message: "Cliente no encontrado" });
  res.json({ message: "Cliente eliminado" });
});

// Obtener un cliente por ID (admin, superadmin y empleado)
router.get(
  "/:id",
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    const gymId = req.user.gymId;
    const client = await Client.findOne({ _id: req.params.id, gymId });
    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });

    // Expirar individualmente si su endDate ya pasó
    if (client.isActive && client.endDate && new Date(client.endDate) < new Date()) {
      client.isActive = false;
      await client.save();
    }

    res.json(client);
  },
);

export default router;
