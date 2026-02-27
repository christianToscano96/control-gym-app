import { Router } from "express";
import mongoose from "mongoose";
import { Client } from "../models/Client";
import { AccessLog } from "../models/AccessLog";
import { Payment } from "../models/Payment";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { expireClientsForGym } from "../utils/expireClients";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

// Obtener estadísticas del dashboard
router.get(
  "/stats",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gym);

      // Obtener fecha de hoy (inicio del día)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Obtener fecha de hace 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Contar total de clientes
      const totalClients = await Client.countDocuments({
        gym: gymId,
      });

      // Contar clientes del mes anterior para calcular porcentaje
      const clientsLastMonth = await Client.countDocuments({
        gym: gymId,
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
        date: { $gte: today },
      });

      // Contar check-ins de ayer para comparar
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCheckIns = await AccessLog.countDocuments({
        gym: gymId,
        date: { $gte: yesterday, $lt: today },
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

      // Horas pico del día (accesos agrupados por hora)
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const peakHoursRaw = await AccessLog.aggregate([
        {
          $match: {
            gym: gymId,
            date: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: { $hour: "$date" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Mapear a franjas horarias legibles
      const hourLabels: Record<number, string> = {
        6: "6AM", 7: "7AM", 8: "8AM", 9: "9AM", 10: "10AM", 11: "11AM",
        12: "12PM", 13: "1PM", 14: "2PM", 15: "3PM", 16: "4PM", 17: "5PM",
        18: "6PM", 19: "7PM", 20: "8PM", 21: "9PM", 22: "10PM",
      };

      // Crear array con todas las horas del gym (6AM-10PM)
      const peakHours = Object.entries(hourLabels).map(([hour, label]) => {
        const found = peakHoursRaw.find((h: any) => h._id === Number(hour));
        return { label, value: found ? found.count : 0 };
      });

      res.json({
        totalClients,
        clientsPercent: `${clientsPercent > 0 ? "+" : ""}${clientsPercent}%`,
        todayCheckIns,
        checkInsPercent: `${checkInsPercent > 0 ? "+" : ""}${checkInsPercent}%`,
        monthlyRevenue,
        revenuePercent: `${revenuePercent > 0 ? "+" : ""}${revenuePercent}%`,
        peakHours,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener estadísticas", error: err });
    }
  },
);

// Obtener asistencia semanal para el chart
router.get(
  "/weekly-attendance",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gym);

      // Calcular inicio de la semana actual (lunes)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Inicio de la semana anterior
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      // Asistencia de la semana actual agrupada por día
      const currentWeekRaw = await AccessLog.aggregate([
        {
          $match: {
            gym: gymId,
            date: { $gte: startOfWeek, $lt: endOfWeek },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$date" }, // 1=Dom, 2=Lun, ..., 7=Sáb
            count: { $sum: 1 },
          },
        },
      ]);

      // Total de la semana anterior
      const lastWeekTotal = await AccessLog.countDocuments({
        gym: gymId,
        date: { $gte: startOfLastWeek, $lt: startOfWeek },
      });

      // Mapear días: MongoDB $dayOfWeek => 1=Dom, 2=Lun, 3=Mar, 4=Mié, 5=Jue, 6=Vie, 7=Sáb
      const dayLabels: { mongo: number; label: string }[] = [
        { mongo: 2, label: "LUN" },
        { mongo: 3, label: "MAR" },
        { mongo: 4, label: "MIÉ" },
        { mongo: 5, label: "JUE" },
        { mongo: 6, label: "VIE" },
        { mongo: 7, label: "SÁB" },
        { mongo: 1, label: "DOM" },
      ];

      let totalWeekly = 0;
      let maxValue = 0;
      let highlightDay = "LUN";

      const weeklyAttendance = dayLabels.map(({ mongo, label }) => {
        const found = currentWeekRaw.find((d: any) => d._id === mongo);
        const value = found ? found.count : 0;
        totalWeekly += value;
        if (value > maxValue) {
          maxValue = value;
          highlightDay = label;
        }
        return { value, label };
      });

      // Calcular porcentaje de cambio vs semana anterior
      const trendValue =
        lastWeekTotal > 0
          ? ((totalWeekly - lastWeekTotal) / lastWeekTotal) * 100
          : 0;
      const trendPercent = `${trendValue > 0 ? "+" : ""}${trendValue.toFixed(1)}% VS LA SEMANA PASADA`;

      res.json({
        weeklyAttendance,
        totalWeekly,
        trendPercent,
        highlightDay,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener asistencia semanal", error: err });
    }
  },
);

// Obtener tasa de actividad de clientes (activos vs inactivos)
router.get(
  "/activity-rate",
  requireRole(["admin", "superadmin"]),
  async (req: AuthRequest, res) => {
    try {
      const gymId = new mongoose.Types.ObjectId(req.user.gym);

      // Expirar clientes antes de calcular la tasa de actividad
      await expireClientsForGym(gymId);

      const activeCount = await Client.countDocuments({
        gym: gymId,
        isActive: true,
      });

      const inactiveCount = await Client.countDocuments({
        gym: gymId,
        isActive: false,
      });

      const total = activeCount + inactiveCount;
      const activityRate =
        total > 0 ? Math.round((activeCount / total) * 100) : 0;

      res.json({
        activeCount,
        inactiveCount,
        activityRate,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener tasa de actividad", error: err });
    }
  },
);

export default router;
