import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { Client } from "../models/Client";
import { Payment } from "../models/Payment";
import { AccessLog } from "../models/AccessLog";
import { Gym } from "../models/Gym";
import { Parser } from "json2csv";

const router = Router();

// Exportar clientes en CSV
router.get(
  "/clients/csv",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const gymId = req.user.gymId;
    const clients = await Client.find({ gymId });
    const fields = [
      "name",
      "email",
      "phone",
      "membershipType",
      "isActive",
      "startDate",
      "endDate",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(clients);
    res.header("Content-Type", "text/csv");
    res.attachment("clientes.csv");
    res.send(csv);
  },
);

// Exportar pagos en CSV
router.get(
  "/payments/csv",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const gymId = req.user.gymId;
      const query: any = { gymId };

      if (req.query.from) {
        query.date = { ...query.date, $gte: new Date(req.query.from as string) };
      }
      if (req.query.to) {
        query.date = { ...query.date, $lte: new Date(req.query.to as string) };
      }

      const payments = await Payment.find(query)
        .populate("client", "firstName lastName")
        .sort({ date: -1 })
        .lean();

      const data = payments.map((p: any) => ({
        cliente: p.client
          ? `${p.client.firstName} ${p.client.lastName}`
          : "N/A",
        monto: p.amount,
        fecha: new Date(p.date).toLocaleDateString("es-ES"),
        metodo: p.method,
        periodo: p.period || "N/A",
        estado: p.status,
      }));

      const fields = ["cliente", "monto", "fecha", "metodo", "periodo", "estado"];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      res.header("Content-Type", "text/csv");
      res.attachment("pagos.csv");
      res.send(csv);
    } catch (err) {
      res.status(500).json({ message: "Error al exportar pagos", error: err });
    }
  },
);

// Exportar asistencias en CSV
router.get(
  "/attendance/csv",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const gymId = req.user.gymId;
      const query: any = { gymId };

      if (req.query.from) {
        query.date = { ...query.date, $gte: new Date(req.query.from as string) };
      }
      if (req.query.to) {
        query.date = { ...query.date, $lte: new Date(req.query.to as string) };
      }

      const logs = await AccessLog.find(query)
        .populate("client", "firstName lastName")
        .sort({ date: -1 })
        .lean();

      const data = logs.map((l: any) => ({
        cliente: l.client
          ? `${l.client.firstName} ${l.client.lastName}`
          : l.clientName || "N/A",
        fecha: new Date(l.date).toLocaleString("es-ES"),
        metodo: l.method || "QR",
      }));

      const fields = ["cliente", "fecha", "metodo"];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      res.header("Content-Type", "text/csv");
      res.attachment("asistencias.csv");
      res.send(csv);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al exportar asistencias", error: err });
    }
  },
);

// Exportar reporte en PDF (simulado)
router.get(
  "/report/pdf",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    // Simulación: solo envía un PDF básico
    res.header("Content-Type", "application/pdf");
    res.attachment("reporte.pdf");
    res.send(Buffer.from("%PDF-1.3\n%Simulated PDF Report\n", "utf-8"));
  },
);

export default router;
