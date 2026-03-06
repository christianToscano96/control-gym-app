import { Router } from "express";
import mongoose from "mongoose";
import { AuthRequest, authenticateJWT, requireRole } from "../middleware/auth";
import { Payment } from "../models/Payment";
import { CashClosure } from "../models/CashClosure";

const router = Router();

const ARG_TIMEZONE = "America/Argentina/Buenos_Aires";

function getDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARG_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function classifyPaymentMethod(method: string): "cash" | "transfer" | "card" | "other" {
  const normalized = (method || "").trim().toLowerCase();

  if (["efectivo", "cash"].includes(normalized)) return "cash";
  if (["transferencia", "transfer", "bank_transfer"].includes(normalized)) return "transfer";
  if (["tarjeta", "card", "credito", "debito"].includes(normalized)) return "card";

  return "other";
}

async function buildDailySummary(gymId: mongoose.Types.ObjectId, dateKey: string) {
  const payments = await Payment.find({
    gymId,
    status: "completed",
    $expr: {
      $eq: [
        {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
            timezone: ARG_TIMEZONE,
          },
        },
        dateKey,
      ],
    },
  }).select("amount method date");

  const breakdown = {
    cash: 0,
    transfer: 0,
    card: 0,
    other: 0,
    total: 0,
  };

  for (const payment of payments) {
    const amount = Number(payment.amount || 0);
    const bucket = classifyPaymentMethod(payment.method);
    breakdown[bucket] += amount;
    breakdown.total += amount;
  }

  return {
    breakdown,
    expectedCash: breakdown.cash,
    paymentCount: payments.length,
  };
}

router.use(authenticateJWT);

router.get("/today", requireRole(["admin", "empleado", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    if (!req.user?.gymId) {
      return res.status(400).json({ message: "gymId no disponible para este usuario" });
    }

    const gymId = new mongoose.Types.ObjectId(req.user.gymId);
    const dateKey = getDateKey();
    const summary = await buildDailySummary(gymId, dateKey);

    const closure = await CashClosure.findOne({ gymId, dateKey })
      .populate("closedBy", "name email")
      .lean();

    return res.json({
      dateKey,
      status: closure ? "closed" : "open",
      ...summary,
      closure: closure
        ? {
            id: closure._id,
            countedCash: closure.countedCash,
            difference: closure.difference,
            notes: closure.notes || "",
            closedAt: closure.closedAt,
            closedBy: closure.closedBy,
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting today cash summary:", error);
    return res.status(500).json({ message: "Error al obtener resumen de caja" });
  }
});

router.post("/close", requireRole(["admin", "empleado", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    if (!req.user?.gymId) {
      return res.status(400).json({ message: "gymId no disponible para este usuario" });
    }

    const countedCash = Number(req.body?.countedCash);
    const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";

    if (!Number.isFinite(countedCash) || countedCash < 0) {
      return res.status(400).json({ message: "El efectivo contado debe ser un número válido" });
    }

    const gymId = new mongoose.Types.ObjectId(req.user.gymId);
    const dateKey = getDateKey();

    const { breakdown, expectedCash } = await buildDailySummary(gymId, dateKey);
    const difference = Number((countedCash - expectedCash).toFixed(2));

    const closure = await CashClosure.findOneAndUpdate(
      { gymId, dateKey },
      {
        gymId,
        dateKey,
        businessDate: new Date(),
        breakdown,
        expectedCash,
        countedCash,
        difference,
        notes,
        closedBy: req.user.id,
        closedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).populate("closedBy", "name email");

    return res.json({
      message: "Cierre de caja registrado correctamente",
      closure,
    });
  } catch (error) {
    console.error("Error closing cash register:", error);
    return res.status(500).json({ message: "Error al registrar cierre de caja" });
  }
});

router.get("/history", requireRole(["admin", "empleado", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    if (!req.user?.gymId) {
      return res.status(400).json({ message: "gymId no disponible para este usuario" });
    }

    const limitRaw = Number(req.query.limit || 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 60) : 10;

    const gymId = new mongoose.Types.ObjectId(req.user.gymId);
    const items = await CashClosure.find({ gymId })
      .sort({ dateKey: -1 })
      .limit(limit)
      .populate("closedBy", "name email")
      .lean();

    return res.json(items);
  } catch (error) {
    console.error("Error fetching cash closure history:", error);
    return res.status(500).json({ message: "Error al obtener historial de caja" });
  }
});

export default router;
