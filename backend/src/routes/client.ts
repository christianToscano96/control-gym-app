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

const router = Router();

// Todas las rutas usan autenticación JWT
router.use(authenticateJWT);

// Obtener todos los clientes del gimnasio (admin, superadmin y empleado)
router.get(
  "/",
  requireRole(["admin", "superadmin", "empleado"]),
  async (req: AuthRequest, res) => {
    const gymId = req.user.gym;
    const clients = await Client.find({ gym: gymId });
    res.json(clients);
  },
);

// Crear cliente en el gimnasio del admin
import { Gym } from "../models/Gym";

router.post("/", requireAdmin, async (req: AuthRequest, res) => {
  const gymId = req.user.gym;
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
    gym: gymId,
    active: true,
  });
  if (currentClients >= maxClients) {
    return res.status(403).json({
      message: `Límite de clientes alcanzado para el plan ${gym.plan}`,
    });
  }

  const client = new Client({ ...req.body, gym: gymId });
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
    const gymId = req.user.gym;
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, gym: gymId },
      req.body,
      { new: true },
    );
    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  },
);

// Eliminar cliente (solo admin y superadmin)
router.delete("/:id", requireAdmin, async (req: AuthRequest, res) => {
  const gymId = req.user.gym;
  const client = await Client.findOneAndDelete({
    _id: req.params.id,
    gym: gymId,
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
    const gymId = req.user.gym;
    const client = await Client.findOne({ _id: req.params.id, gym: gymId });
    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  },
);

export default router;
