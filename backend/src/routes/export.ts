import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { Client } from "../models/Client";
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
