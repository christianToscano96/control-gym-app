import { Router } from "express";
import mongoose from "mongoose";
import { MonthlySnapshot } from "../models/MonthlySnapshot";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { generateSnapshotForGym } from "../jobs/snapshotJob";

const router = Router();

router.use(authenticateJWT);

// Obtener snapshots históricos del gimnasio
// Query: ?from=YYYY-MM&to=YYYY-MM (opcional, default últimos 12 meses)
router.get(
  "/",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gymId);

      let fromYear: number, fromMonth: number, toYear: number, toMonth: number;

      if (req.query.from && typeof req.query.from === "string") {
        const [y, m] = req.query.from.split("-").map(Number);
        fromYear = y;
        fromMonth = m;
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() - 12);
        fromYear = d.getFullYear();
        fromMonth = d.getMonth() + 1;
      }

      if (req.query.to && typeof req.query.to === "string") {
        const [y, m] = req.query.to.split("-").map(Number);
        toYear = y;
        toMonth = m;
      } else {
        const d = new Date();
        toYear = d.getFullYear();
        toMonth = d.getMonth() + 1;
      }

      const snapshots = await MonthlySnapshot.find({
        gymId,
        $or: [
          { year: { $gt: fromYear, $lt: toYear } },
          { year: fromYear, month: { $gte: fromMonth } },
          { year: toYear, month: { $lte: toMonth } },
        ],
      }).sort({ year: 1, month: 1 });

      res.json(snapshots);
    } catch (err) {
      res.status(500).json({
        message: "Error al obtener snapshots",
        error: err,
      });
    }
  },
);

// Obtener snapshot de un mes específico
router.get(
  "/:year/:month",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gymId);
      const year = parseInt(req.params.year, 10);
      const month = parseInt(req.params.month, 10);

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Año o mes inválido" });
      }

      const snapshot = await MonthlySnapshot.findOne({ gymId, year, month });

      if (!snapshot) {
        return res.status(404).json({
          message: "No se encontró snapshot para este período",
        });
      }

      res.json(snapshot);
    } catch (err) {
      res.status(500).json({
        message: "Error al obtener snapshot",
        error: err,
      });
    }
  },
);

// Generar snapshot manualmente
router.post(
  "/generate",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gymId);
      const { year, month } = req.body;

      if (!year || !month || month < 1 || month > 12) {
        return res
          .status(400)
          .json({ message: "Año y mes son requeridos (mes: 1-12)" });
      }

      await generateSnapshotForGym(gymId, year, month);

      const snapshot = await MonthlySnapshot.findOne({ gymId, year, month });

      res.json({
        message: "Snapshot generado exitosamente",
        snapshot,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error al generar snapshot",
        error: err,
      });
    }
  },
);

export default router;
