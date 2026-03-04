import { Router } from "express";
import mongoose from "mongoose";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { Gym } from "../models/Gym";
import { MonthlyReport } from "../models/MonthlyReport";
import { MonthlySnapshot } from "../models/MonthlySnapshot";
import { generateSnapshotForGym } from "../jobs/snapshotJob";
import { AccessLog } from "../models/AccessLog";
import { Payment } from "../models/Payment";

const router = Router();

router.use(authenticateJWT);
const ARG_TIMEZONE = "America/Argentina/Buenos_Aires";

function parseYearMonth(input?: string): { year: number; month: number } | null {
  if (!input) return null;
  const parts = input.split("-");
  if (parts.length !== 2) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthNumericKey(year: number, month: number): number {
  return year * 100 + month;
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

function hourLabel(hour: number | null): string {
  if (hour === null || Number.isNaN(hour)) return "-";
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}${suffix}`;
}

function attendanceRecommendations(input: {
  deniedCheckIns: number;
  allowedCheckIns: number;
  peakHourLabel: string;
  peakHourCount: number;
  dailyAttendancePct: Array<{ label: string; percentage: number }>;
}): string[] {
  const recommendations: string[] = [];
  const total = input.allowedCheckIns + input.deniedCheckIns;
  const deniedRate = total > 0 ? (input.deniedCheckIns / total) * 100 : 0;

  if (deniedRate >= 8) {
    recommendations.push(
      `Alta tasa de rechazos (${deniedRate.toFixed(1)}%). Revisar vencimientos y reforzar recordatorios de renovación 48h antes.`,
    );
  } else if (input.deniedCheckIns > 0) {
    recommendations.push(
      `Se detectaron ${input.deniedCheckIns} rechazos. Habilitar alertas preventivas para reducir fricción en el ingreso.`,
    );
  }

  if (input.peakHourCount > 0 && input.peakHourLabel !== "-") {
    recommendations.push(
      `La hora pico fue ${input.peakHourLabel} (${input.peakHourCount} ingresos). Reforzar personal de recepción en esa franja.`,
    );
  }

  const topDay = [...input.dailyAttendancePct]
    .sort((a, b) => b.percentage - a.percentage)[0];
  const lowDay = [...input.dailyAttendancePct]
    .sort((a, b) => a.percentage - b.percentage)[0];

  if (topDay && lowDay && topDay.label !== lowDay.label) {
    recommendations.push(
      `Mayor tracción en ${topDay.label} (${topDay.percentage.toFixed(1)}%). Activar promos de asistencia para ${lowDay.label} (${lowDay.percentage.toFixed(1)}%).`,
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Operación estable: mantener seguimiento mensual y ajustar acciones según tendencia de ingresos y rechazos.",
    );
  }

  return recommendations;
}

async function computeAccessMetricsForMonth(
  gymId: mongoose.Types.ObjectId,
  year: number,
  month: number,
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const statusAgg = await AccessLog.aggregate([
    { $match: { gymId, date: { $gte: start, $lt: end } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const allowedCheckIns =
    statusAgg.find((s: any) => s._id === "allowed")?.count || 0;
  const deniedCheckIns =
    statusAgg.find((s: any) => s._id === "denied")?.count || 0;
  const totalCheckIns = allowedCheckIns + deniedCheckIns;

  const peakHourAgg = await AccessLog.aggregate([
    {
      $match: {
        gymId,
        date: { $gte: start, $lt: end },
        status: "allowed",
      },
    },
    {
      $group: {
        _id: {
          $hour: {
            date: "$date",
            timezone: ARG_TIMEZONE,
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 1 },
  ]);

  const peakHourRaw = peakHourAgg[0];
  const peakHourHour =
    peakHourRaw && typeof peakHourRaw._id === "number" ? peakHourRaw._id : null;
  const peakHourCount = peakHourRaw?.count || 0;
  const peakHourLabel = hourLabel(peakHourHour);

  const dayLabels: Record<number, string> = {
    1: "Domingo",
    2: "Lunes",
    3: "Martes",
    4: "Miercoles",
    5: "Jueves",
    6: "Viernes",
    7: "Sabado",
  };

  const dailyAgg = await AccessLog.aggregate([
    {
      $match: {
        gymId,
        date: { $gte: start, $lt: end },
        status: "allowed",
      },
    },
    {
      $group: {
        _id: {
          $dayOfWeek: {
            date: "$date",
            timezone: ARG_TIMEZONE,
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyAttendancePct = [1, 2, 3, 4, 5, 6, 7].map((day) => {
    const count = dailyAgg.find((d: any) => d._id === day)?.count || 0;
    const percentage =
      allowedCheckIns > 0 ? Math.round((count / allowedCheckIns) * 1000) / 10 : 0;
    return {
      day,
      label: dayLabels[day],
      count,
      percentage,
    };
  });

  return {
    totalCheckIns,
    allowedCheckIns,
    deniedCheckIns,
    peakHour: {
      hour: peakHourHour,
      label: peakHourLabel,
      count: peakHourCount,
    },
    dailyAttendancePct,
    recommendations: attendanceRecommendations({
      deniedCheckIns,
      allowedCheckIns,
      peakHourLabel,
      peakHourCount,
      dailyAttendancePct,
    }),
  };
}

async function computeRenewedMembershipsForMonth(
  gymId: mongoose.Types.ObjectId,
  year: number,
  month: number,
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const renewedAgg = await Payment.aggregate([
    {
      $match: {
        gymId,
        status: "completed",
        client: { $exists: true, $ne: null },
        date: { $gte: start, $lt: end },
      },
    },
    {
      $lookup: {
        from: "clients",
        localField: "client",
        foreignField: "_id",
        as: "clientDoc",
      },
    },
    { $unwind: "$clientDoc" },
    {
      $match: {
        "clientDoc.createdAt": { $lt: start },
      },
    },
    { $count: "total" },
  ]);

  return renewedAgg[0]?.total || 0;
}

function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
}

function* iterateMonths(
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number,
): Generator<{ year: number; month: number }> {
  let y = fromYear;
  let m = fromMonth;
  while (y < toYear || (y === toYear && m <= toMonth)) {
    yield { year: y, month: m };
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
}

async function upsertMonthlyReportFromSnapshot(
  gymId: mongoose.Types.ObjectId,
  year: number,
  month: number,
) {
  const snapshot = await MonthlySnapshot.findOne({ gymId, year, month });
  if (!snapshot) return null;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const accessMetrics = await computeAccessMetricsForMonth(gymId, year, month);
  const renewedMemberships = await computeRenewedMembershipsForMonth(
    gymId,
    year,
    month,
  );

  const report = await MonthlyReport.findOneAndUpdate(
    { gymId, year, month },
    {
      $set: {
        title: `Cierre mensual ${getMonthLabel(year, month)}`,
        periodStart: start,
        periodEnd: end,
        generatedAt: new Date(),
        status: isCurrentMonth(year, month) ? "processing" : "completed",
        sourceSnapshotId: snapshot._id,
        metrics: {
          revenue: snapshot.revenue,
          totalClients: snapshot.totalClients,
          totalCheckIns: accessMetrics.totalCheckIns,
          allowedCheckIns: accessMetrics.allowedCheckIns,
          deniedCheckIns: accessMetrics.deniedCheckIns,
          peakHour: accessMetrics.peakHour,
          dailyAttendancePct: accessMetrics.dailyAttendancePct,
          newClients: snapshot.newClients,
          renewedMemberships,
          churnedClients: snapshot.churnedClients,
          averageRevenuePerClient: snapshot.averageRevenuePerClient,
          membershipDistribution: snapshot.membershipDistribution,
          recommendations: accessMetrics.recommendations,
        },
      },
    },
    { upsert: true, new: true },
  );

  return report;
}

router.get(
  "/monthly",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gymId);
      const gym = await Gym.findById(gymId).select("createdAt");

      if (!gym) {
        return res.status(404).json({ message: "Gimnasio no encontrado" });
      }

      const now = new Date();
      const defaultFrom = {
        year: gym.createdAt.getFullYear(),
        month: gym.createdAt.getMonth() + 1,
      };
      const defaultTo = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      };

      const from = parseYearMonth(req.query.from as string) || defaultFrom;
      const to = parseYearMonth(req.query.to as string) || defaultTo;
      const fromKey = monthNumericKey(from.year, from.month);
      const toKey = monthNumericKey(to.year, to.month);

      if (from.year > to.year || (from.year === to.year && from.month > to.month)) {
        return res.status(400).json({ message: "Rango de meses inválido" });
      }

      for (const { year, month } of iterateMonths(
        from.year,
        from.month,
        to.year,
        to.month,
      )) {
        const existing = await MonthlyReport.findOne({ gymId, year, month })
          .select("_id status metrics.allowedCheckIns metrics.dailyAttendancePct")
          .lean();

        const missingAccessMetrics =
          !existing ||
          typeof existing.metrics?.allowedCheckIns !== "number" ||
          !Array.isArray(existing.metrics?.dailyAttendancePct) ||
          existing.metrics.dailyAttendancePct.length === 0;

        const shouldRefresh =
          !existing || isCurrentMonth(year, month) || missingAccessMetrics;
        if (!shouldRefresh) continue;

        await generateSnapshotForGym(gymId, year, month);
        await upsertMonthlyReportFromSnapshot(gymId, year, month);
      }

      const reports = await MonthlyReport.find({
        gymId,
        $expr: {
          $and: [
            {
              $gte: [
                { $add: [{ $multiply: ["$year", 100] }, "$month"] },
                fromKey,
              ],
            },
            {
              $lte: [
                { $add: [{ $multiply: ["$year", 100] }, "$month"] },
                toKey,
              ],
            },
          ],
        },
      }).sort({ year: -1, month: -1 });

      return res.json({
        reports,
        range: {
          from: monthKey(from.year, from.month),
          to: monthKey(to.year, to.month),
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: "Error al obtener reportes mensuales",
        error: err,
      });
    }
  },
);

router.get(
  "/monthly/:year/:month",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gymId);
      const year = Number(req.params.year);
      const month = Number(req.params.month);

      if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Año o mes inválido" });
      }

      await generateSnapshotForGym(gymId, year, month);
      const report = await upsertMonthlyReportFromSnapshot(gymId, year, month);

      if (!report) {
        return res
          .status(404)
          .json({ message: "No se pudo generar reporte para el período indicado" });
      }

      return res.json(report);
    } catch (err) {
      return res.status(500).json({
        message: "Error al obtener reporte mensual",
        error: err,
      });
    }
  },
);

export default router;
