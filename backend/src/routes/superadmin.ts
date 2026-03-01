import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  authenticateJWT,
  requireSuperAdmin,
  AuthRequest,
} from "../middleware/auth";
import { Gym } from "../models/Gym";
import { User } from "../models/User";
import { Membership } from "../models/Membership";
import { Client } from "../models/Client";

const router = Router();

// Todas las rutas requieren superadmin
router.use(authenticateJWT, requireSuperAdmin);

// Vista general para el panel SuperAdmin
router.get("/overview", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email avatar active gymId")
      .populate("gymId", "name address plan active")
      .lean();

    const clientCounts = await Client.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$gymId", count: { $sum: 1 } } },
    ]);
    const clientCountMap = new Map(
      clientCounts.map((c: any) => [c._id.toString(), c.count])
    );

    const allGyms = await Gym.find().lean();
    const activeGyms = allGyms.filter((g) => g.active).length;
    const totalClients = clientCounts.reduce(
      (sum: number, c: any) => sum + c.count,
      0
    );

    const revenueAgg = await Membership.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const formattedAdmins = admins.map((admin: any) => {
      const gym = admin.gymId;
      return {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        active: admin.active,
        gym: gym
          ? {
              _id: gym._id,
              name: gym.name,
              address: gym.address,
              plan: gym.plan,
              active: gym.active,
              clientsCount: clientCountMap.get(gym._id.toString()) || 0,
            }
          : null,
      };
    });

    res.json({
      summary: {
        totalGyms: allGyms.length,
        activeGyms,
        inactiveGyms: allGyms.length - activeGyms,
        totalClients,
        totalRevenue,
        planDistribution: {
          basico: allGyms.filter((g) => g.plan === "basico").length,
          pro: allGyms.filter((g) => g.plan === "pro").length,
          proplus: allGyms.filter((g) => g.plan === "proplus").length,
        },
      },
      admins: formattedAdmins,
    });
  } catch (error) {
    console.error("Error in superadmin overview:", error);
    res.status(500).json({ message: "Error al obtener el resumen" });
  }
});

// Detalle de un gimnasio para SuperAdmin
router.get("/gyms/:gymId/detail", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId).lean();
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });

    const admin = await User.findOne({ gymId: gym._id, role: "admin" })
      .select("name email avatar")
      .lean();

    const membership = await Membership.findOne({ gymId: gym._id, active: true })
      .select("plan startDate endDate active amount")
      .lean();

    const clientsCount = await Client.countDocuments({ gymId: gym._id });
    const activeClientsCount = await Client.countDocuments({
      gymId: gym._id,
      isActive: true,
    });

    const revenueAgg = await Membership.aggregate([
      { $match: { gymId: gym._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      gym: {
        _id: gym._id,
        name: gym.name,
        address: gym.address,
        plan: gym.plan,
        active: gym.active,
        createdAt: (gym as any).createdAt,
      },
      admin: admin || null,
      membership: membership || null,
      clientsCount,
      activeClientsCount,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error in gym detail:", error);
    res.status(500).json({ message: "Error al obtener el detalle" });
  }
});

// Reporte: gimnasios activos/inactivos
router.get("/report/gyms-status", async (req, res) => {
  const activos = await Gym.countDocuments({ active: true });
  const inactivos = await Gym.countDocuments({ active: false });
  res.json({ activos, inactivos });
});

// Reporte: membresías por plan
router.get("/report/memberships-by-plan", async (req, res) => {
  const basico = await Membership.countDocuments({
    plan: "basico",
    active: true,
  });
  const pro = await Membership.countDocuments({ plan: "pro", active: true });
  const proplus = await Membership.countDocuments({
    plan: "proplus",
    active: true,
  });
  res.json({ basico, pro, proplus });
});

// Reporte: clientes totales y por gimnasio
router.get("/report/clients", async (req, res) => {
  const total = await Client.countDocuments({ isActive: true });
  // Clientes por gimnasio
  const porGimnasio = await Client.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$gymId", count: { $sum: 1 } } },
  ]);
  res.json({ total, porGimnasio });
});

// Activar/desactivar gimnasio
router.put("/gyms/:gymId/active", async (req, res) => {
  try {
    const { active } = req.body;
    const gym = await Gym.findByIdAndUpdate(
      req.params.gymId,
      { active },
      { new: true },
    );
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });

    const activeMembership = await Membership.findOne({
      gymId: gym._id,
      active: true,
    });

    if (activeMembership) {
      const now = new Date();
      if (active) {
        // Enabling: reset start to now, expiration to +1 month
        const endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 1);
        activeMembership.startDate = now;
        activeMembership.endDate = endDate;
      } else {
        // Disabling: expire membership immediately
        activeMembership.endDate = now;
      }
      await activeMembership.save();
    }

    res.json(gym);
  } catch (error) {
    console.error("Error toggling gym active:", error);
    res.status(500).json({ message: "Error al cambiar estado del gimnasio" });
  }
});

// Resetear contraseña de admin
router.put("/admins/:id/reset-password", async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: "Contraseña inválida" });
  const hashed = await bcrypt.hash(newPassword, 10);
  const admin = await User.findOneAndUpdate(
    { _id: req.params.id, role: "admin" },
    { password: hashed },
    { new: true },
  );
  if (!admin) return res.status(404).json({ message: "Admin no encontrado" });
  res.json({ message: "Contraseña reseteada correctamente" });
});

// Listar todos los gimnasios
router.get("/gyms", async (req, res) => {
  const gyms = await Gym.find().populate("owner", "name email");
  res.json(gyms);
});

// Ver y editar un admin de gimnasio
router.get("/admins/:id", async (req, res) => {
  const admin = await User.findById(req.params.id).populate("gymId", "name");
  if (!admin || admin.role !== "admin")
    return res.status(404).json({ message: "Admin no encontrado" });
  res.json(admin);
});

router.put("/admins/:id", async (req, res) => {
  const admin = await User.findOneAndUpdate(
    { _id: req.params.id, role: "admin" },
    req.body,
    { new: true },
  );
  if (!admin) return res.status(404).json({ message: "Admin no encontrado" });
  res.json(admin);
});

// Editar gimnasio (nombre, dirección, plan)
router.put("/gyms/:gymId", async (req, res) => {
  try {
    const { name, address, plan } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (plan && ["basico", "pro", "proplus"].includes(plan)) {
      updateData.plan = plan;
    }
    const gym = await Gym.findByIdAndUpdate(req.params.gymId, updateData, {
      new: true,
    });
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });
    res.json(gym);
  } catch (error) {
    console.error("Error updating gym:", error);
    res.status(500).json({ message: "Error al editar gimnasio" });
  }
});

// Eliminar gimnasio + admin + membresías + clientes
router.delete("/gyms/:gymId", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });

    await Promise.all([
      User.deleteMany({ gymId: gym._id }),
      Membership.deleteMany({ gymId: gym._id }),
      Client.deleteMany({ gymId: gym._id }),
      Gym.findByIdAndDelete(gym._id),
    ]);

    res.json({ message: "Gimnasio eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting gym:", error);
    res.status(500).json({ message: "Error al eliminar gimnasio" });
  }
});

// Listar membresías de un gimnasio
router.get("/gyms/:gymId/memberships", async (req, res) => {
  const memberships = await Membership.find({ gymId: req.params.gymId });
  res.json(memberships);
});

// Editar membresía (por ejemplo, cambiar fechas o estado)
router.put("/memberships/:id", async (req, res) => {
  const membership = await Membership.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  if (!membership)
    return res.status(404).json({ message: "Membresía no encontrada" });
  res.json(membership);
});

export default router;
