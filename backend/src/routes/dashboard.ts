import { Router } from "express";
import { Client } from "../models/Client";
import { AccessLog } from "../models/AccessLog";
import { Payment } from "../models/Payment";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

// Obtener estadísticas del dashboard
router.get(
  "/stats",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = req.user.gym;

      // Obtener fecha de hoy (inicio del día)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Obtener fecha de hace 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Contar total de clientes activos
      const totalClients = await Client.countDocuments({
        gym: gymId,
        active: true,
      });

      // Contar clientes del mes anterior para calcular porcentaje
      const clientsLastMonth = await Client.countDocuments({
        gym: gymId,
        active: true,
        createdAt: { $lt: thirtyDaysAgo },
      });

      // Calcular porcentaje de cambio de clientes
      const clientsPercent =
        clientsLastMonth > 0
          ? Math.round(
              ((totalClients - clientsLastMonth) / clientsLastMonth) * 100,
            )
          : 0;

      // Contar check-ins del día (ingresos del día)
      const todayCheckIns = await AccessLog.countDocuments({
        gym: gymId,
        timestamp: { $gte: today },
      });

      // Contar check-ins de ayer para comparar
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCheckIns = await AccessLog.countDocuments({
        gym: gymId,
        timestamp: { $gte: yesterday, $lt: today },
      });

      // Calcular porcentaje de cambio de ingresos
      const checkInsPercent =
        yesterdayCheckIns > 0
          ? Math.round(
              ((todayCheckIns - yesterdayCheckIns) / yesterdayCheckIns) * 100,
            )
          : 0;

      // Ingresos del mes actual
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const monthlyPayments = await Payment.aggregate([
        {
          $match: {
            gym: gymId,
            date: { $gte: firstDayOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const monthlyRevenue =
        monthlyPayments.length > 0 ? monthlyPayments[0].total : 0;

      // Ingresos del mes anterior
      const firstDayOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      const lastDayOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      );
      const lastMonthPayments = await Payment.aggregate([
        {
          $match: {
            gym: gymId,
            date: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const lastMonthRevenue =
        lastMonthPayments.length > 0 ? lastMonthPayments[0].total : 0;

      // Calcular porcentaje de cambio de ingresos
      const revenuePercent =
        lastMonthRevenue > 0
          ? Math.round(
              ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
            )
          : 0;

      res.json({
        totalClients,
        clientsPercent: `${clientsPercent > 0 ? "+" : ""}${clientsPercent}%`,
        todayCheckIns,
        checkInsPercent: `${checkInsPercent > 0 ? "+" : ""}${checkInsPercent}%`,
        monthlyRevenue,
        revenuePercent: `${revenuePercent > 0 ? "+" : ""}${revenuePercent}%`,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener estadísticas", error: err });
    }
  },
);

export default router;
