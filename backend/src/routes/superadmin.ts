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
import { AccessLog } from "../models/AccessLog";
import { Payment } from "../models/Payment";
import { AuditLog } from "../models/AuditLog";
import { MonthlySnapshot } from "../models/MonthlySnapshot";
import {
  getPlatformPlanPrices,
  upsertPlatformPlanPrices,
} from "../utils/planPricing";

const router = Router();

// Todas las rutas requieren superadmin
router.use(authenticateJWT, requireSuperAdmin);

const buildSuperAdminSummary = async () => {
  const clientCounts = await Client.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$gymId", count: { $sum: 1 } } },
  ]);

  const allGyms = await Gym.find().lean();
  const activeGyms = allGyms.filter((g) => g.active).length;
  const pendingGyms = allGyms.filter(
    (g) => g.onboardingStatus === "pending",
  ).length;
  const totalClients = clientCounts.reduce(
    (sum: number, c: any) => sum + c.count,
    0,
  );

  const platformRevenueAgg = await Membership.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalPlatformRevenue = platformRevenueAgg[0]?.total || 0;

  const gymRevenueAgg = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalGymRevenue = gymRevenueAgg[0]?.total || 0;

  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const expiringGymMemberships = await Membership.find({
    active: true,
    endDate: { $gte: now, $lte: sevenDaysFromNow },
  })
    .populate("gymId", "name plan")
    .lean();

  const expiringGyms = expiringGymMemberships.map((m: any) => ({
    gymId: m.gymId?._id,
    gymName: m.gymId?.name || "Sin nombre",
    plan: m.plan,
    endDate: m.endDate,
    daysLeft: Math.ceil(
      (new Date(m.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    ),
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCheckIns = await AccessLog.countDocuments({
    date: { $gte: today },
    $or: [{ status: "allowed" }, { status: { $exists: false } }],
  });

  return {
    totalGyms: allGyms.length,
    activeGyms,
    inactiveGyms: allGyms.length - activeGyms,
    pendingGyms,
    totalClients,
    totalPlatformRevenue,
    totalGymRevenue,
    todayCheckIns,
    planDistribution: {
      basico: allGyms.filter((g) => g.plan === "basico").length,
      pro: allGyms.filter((g) => g.plan === "pro").length,
      proplus: allGyms.filter((g) => g.plan === "proplus").length,
    },
    expiringGyms,
  };
};

// ─── Pending Registrations ───────────────────────────────────
router.get("/pending-registrations", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email avatar active gymId")
      .populate("gymId", "name address plan active onboardingStatus paymentReference paymentProofUrl paymentProofUploadedAt")
      .lean();

    const pendingAdmins = admins
      .filter((admin: any) => admin.gymId?.onboardingStatus === "pending")
      .sort((a: any, b: any) => {
        const aDate = new Date(a.gymId?.paymentProofUploadedAt || a.gymId?.createdAt || 0).getTime();
        const bDate = new Date(b.gymId?.paymentProofUploadedAt || b.gymId?.createdAt || 0).getTime();
        return bDate - aDate;
      })
      .map((admin: any) => ({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        active: admin.active,
        gym: admin.gymId
          ? {
              _id: admin.gymId._id,
              name: admin.gymId.name,
              address: admin.gymId.address,
              plan: admin.gymId.plan,
              active: admin.gymId.active,
              onboardingStatus: admin.gymId.onboardingStatus || "pending",
              paymentReference: admin.gymId.paymentReference || null,
              hasPaymentProof: Boolean(admin.gymId.paymentProofUrl),
              clientsCount: 0,
            }
          : null,
      }));

    res.json({ pendingAdmins });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({ message: "Error al obtener pendientes" });
  }
});

// ─── Overview ────────────────────────────────────────────────
router.get("/overview", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email avatar active gymId")
      .populate("gymId", "name address plan active onboardingStatus paymentReference paymentProofUrl")
      .lean();

    const clientCounts = await Client.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$gymId", count: { $sum: 1 } } },
    ]);
    const clientCountMap = new Map(
      clientCounts.map((c: any) => [c._id.toString(), c.count]),
    );
    const summary = await buildSuperAdminSummary();

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
              onboardingStatus: gym.onboardingStatus || "approved",
              paymentReference: gym.paymentReference || null,
              hasPaymentProof: Boolean(gym.paymentProofUrl),
              clientsCount: clientCountMap.get(gym._id.toString()) || 0,
            }
          : null,
      };
    });

    res.json({
      summary,
      admins: formattedAdmins,
    });
  } catch (error) {
    console.error("Error in superadmin overview:", error);
    res.status(500).json({ message: "Error al obtener el resumen" });
  }
});

// ─── Summary ─────────────────────────────────────────────────
router.get("/summary", async (req, res) => {
  try {
    const summary = await buildSuperAdminSummary();
    res.json(summary);
  } catch (error) {
    console.error("Error in superadmin summary:", error);
    res.status(500).json({ message: "Error al obtener el summary" });
  }
});

// ─── Admins List ─────────────────────────────────────────────
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email avatar active gymId")
      .populate(
        "gymId",
        "name address plan active onboardingStatus paymentReference paymentProofUrl",
      )
      .lean();

    const clientCounts = await Client.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$gymId", count: { $sum: 1 } } },
    ]);
    const clientCountMap = new Map(
      clientCounts.map((c: any) => [c._id.toString(), c.count]),
    );

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
              onboardingStatus: gym.onboardingStatus || "approved",
              paymentReference: gym.paymentReference || null,
              hasPaymentProof: Boolean(gym.paymentProofUrl),
              clientsCount: clientCountMap.get(gym._id.toString()) || 0,
            }
          : null,
      };
    });

    res.json({ admins: formattedAdmins });
  } catch (error) {
    console.error("Error fetching superadmin admins:", error);
    res.status(500).json({ message: "Error al obtener admins" });
  }
});

// ─── Plan Prices Config ─────────────────────────────────────
router.get("/plan-prices", async (req, res) => {
  try {
    const planPrices = await getPlatformPlanPrices();
    res.json({ planPrices });
  } catch (error) {
    console.error("Error fetching plan prices:", error);
    res.status(500).json({ message: "Error al obtener precios de planes" });
  }
});

router.put("/plan-prices", async (req, res) => {
  try {
    const { planPrices } = req.body as {
      planPrices?: { basico?: number; pro?: number; proplus?: number };
    };

    if (!planPrices) {
      return res.status(400).json({ message: "planPrices es requerido" });
    }
    if (
      [planPrices.basico, planPrices.pro, planPrices.proplus].some(
        (n) => typeof n !== "number" || Number.isNaN(n) || n < 0,
      )
    ) {
      return res.status(400).json({ message: "Todos los precios deben ser números >= 0" });
    }

    const updated = await upsertPlatformPlanPrices(planPrices);
    res.json({ message: "Precios actualizados", planPrices: updated });
  } catch (error) {
    console.error("Error updating plan prices:", error);
    res.status(500).json({ message: "Error al actualizar precios de planes" });
  }
});

// ─── Gym Detail ──────────────────────────────────────────────
router.get("/gyms/:gymId/detail", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId).lean();
    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });

    const admin = await User.findOne({ gymId: gym._id, role: "admin" })
      .select("name email avatar")
      .lean();

    const membership = await Membership.findOne({
      gymId: gym._id,
      active: true,
    })
      .select(
        "plan startDate endDate active amount paymentReference paymentProofUrl reviewStatus reviewedAt reviewNotes",
      )
      .lean();

    const clientsCount = await Client.countDocuments({ gymId: gym._id });
    const activeClientsCount = await Client.countDocuments({
      gymId: gym._id,
      isActive: true,
    });

    // Revenue plataforma (Membership SaaS)
    const platformRevenueAgg = await Membership.aggregate([
      { $match: { gymId: gym._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const platformRevenue = platformRevenueAgg[0]?.total || 0;

    // Revenue del gym (pagos de clientes)
    const gymRevenueAgg = await Payment.aggregate([
      { $match: { gymId: gym._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const gymRevenue = gymRevenueAgg[0]?.total || 0;

    // Revenue mensual del gym (mes actual)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenueAgg = await Payment.aggregate([
      { $match: { gymId: gym._id, status: "completed", date: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const monthlyGymRevenue = monthlyRevenueAgg[0]?.total || 0;

    // Check-ins de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCheckIns = await AccessLog.countDocuments({
      gymId: gym._id,
      date: { $gte: today },
      $or: [{ status: "allowed" }, { status: { $exists: false } }],
    });
    const todayDenied = await AccessLog.countDocuments({
      gymId: gym._id,
      date: { $gte: today },
      status: "denied",
    });

    // Staff count
    const staffCount = await User.countDocuments({
      gymId: gym._id,
      role: "empleado",
    });

    res.json({
      gym: {
        _id: gym._id,
        name: gym.name,
        address: gym.address,
        plan: gym.plan,
        active: gym.active,
        onboardingStatus: gym.onboardingStatus || "approved",
        paymentReference: gym.paymentReference || null,
        paymentProofUrl: gym.paymentProofUrl || null,
        paymentProofUploadedAt: gym.paymentProofUploadedAt || null,
        paymentRejectionReason: gym.paymentRejectionReason || null,
        createdAt: (gym as any).createdAt,
      },
      admin: admin || null,
      membership: membership || null,
      clientsCount,
      activeClientsCount,
      platformRevenue,
      gymRevenue,
      monthlyGymRevenue,
      todayCheckIns,
      todayDenied,
      staffCount,
    });
  } catch (error) {
    console.error("Error in gym detail:", error);
    res.status(500).json({ message: "Error al obtener el detalle" });
  }
});

// ─── Gym Clients ─────────────────────────────────────────────
router.get("/gyms/:gymId/clients", async (req, res) => {
  try {
    const { search, status, limit: limitStr } = req.query;
    const filter: any = { gymId: req.params.gymId };

    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    if (search) {
      const regex = new RegExp(search as string, "i");
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    const limit = Math.min(Number(limitStr) || 50, 100);

    const clients = await Client.find(filter)
      .select("firstName lastName email membershipType isActive startDate endDate")
      .sort({ isActive: -1, endDate: 1 })
      .limit(limit)
      .lean();

    const total = await Client.countDocuments({ gymId: req.params.gymId });

    res.json({ clients, total });
  } catch (error) {
    console.error("Error fetching gym clients:", error);
    res.status(500).json({ message: "Error al obtener clientes del gym" });
  }
});

// ─── Gym Payments ────────────────────────────────────────────
router.get("/gyms/:gymId/payments", async (req, res) => {
  try {
    const { limit: limitStr } = req.query;
    const limit = Math.min(Number(limitStr) || 20, 100);

    const payments = await Payment.find({ gymId: req.params.gymId })
      .populate("client", "firstName lastName")
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Revenue mensual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyAgg = await Payment.aggregate([
      {
        $match: {
          gymId: (await Gym.findById(req.params.gymId))?._id,
          status: "completed",
          date: { $gte: firstDayOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAgg = await Payment.aggregate([
      {
        $match: {
          gymId: (await Gym.findById(req.params.gymId))?._id,
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      payments: payments.map((p: any) => ({
        _id: p._id,
        clientName: p.client
          ? `${p.client.firstName} ${p.client.lastName}`
          : "—",
        amount: p.amount,
        method: p.method,
        period: p.period,
        status: p.status,
        date: p.date,
      })),
      monthlyRevenue: monthlyAgg[0]?.total || 0,
      totalRevenue: totalAgg[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching gym payments:", error);
    res.status(500).json({ message: "Error al obtener pagos del gym" });
  }
});

// ─── Gym Access Logs ─────────────────────────────────────────
router.get("/gyms/:gymId/access-logs", async (req, res) => {
  try {
    const { limit: limitStr } = req.query;
    const limit = Math.min(Number(limitStr) || 20, 100);

    const logs = await AccessLog.find({ gymId: req.params.gymId })
      .populate("client", "firstName lastName membershipType")
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAllowed = await AccessLog.countDocuments({
      gymId: req.params.gymId,
      date: { $gte: today },
      $or: [{ status: "allowed" }, { status: { $exists: false } }],
    });

    const todayDenied = await AccessLog.countDocuments({
      gymId: req.params.gymId,
      date: { $gte: today },
      status: "denied",
    });

    res.json({
      logs: logs.map((l: any) => ({
        _id: l._id,
        clientName: l.client
          ? `${l.client.firstName} ${l.client.lastName}`
          : "Desconocido",
        membershipType: l.client?.membershipType || "—",
        method: l.method,
        status: l.status,
        denyReason: l.denyReason,
        date: l.date,
      })),
      todayAllowed,
      todayDenied,
    });
  } catch (error) {
    console.error("Error fetching gym access logs:", error);
    res.status(500).json({ message: "Error al obtener accesos del gym" });
  }
});

// ─── Gym Staff ───────────────────────────────────────────────
router.get("/gyms/:gymId/staff", async (req, res) => {
  try {
    const staff = await User.find({
      gymId: req.params.gymId,
      role: "empleado",
    })
      .select("name email avatar active role")
      .lean();

    res.json(staff);
  } catch (error) {
    console.error("Error fetching gym staff:", error);
    res.status(500).json({ message: "Error al obtener staff del gym" });
  }
});

// ─── Create Gym ──────────────────────────────────────────────
router.post("/gyms", async (req, res) => {
  try {
    const { gymName, gymAddress, adminName, adminEmail, adminPassword, plan } =
      req.body;
    const planPrices = await getPlatformPlanPrices();

    if (!gymName || !adminName || !adminEmail || !adminPassword || !plan) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    if (!["basico", "pro", "proplus"].includes(plan)) {
      return res.status(400).json({ message: "Plan inválido" });
    }
    const planKey = plan as keyof Awaited<ReturnType<typeof getPlatformPlanPrices>>;
    if (adminPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const exists = await User.findOne({ email: adminEmail });
    if (exists) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const gym = await Gym.create({
      name: gymName,
      address: gymAddress || "",
      plan,
      active: true,
      onboardingStatus: "approved",
      clientsCount: 0,
    });

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "admin",
      gymId: gym._id,
      active: true,
    });

    gym.owner = admin._id as any;
    await gym.save();

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + 1);

    await Membership.create({
      gymId: gym._id,
      plan,
      amount: planPrices[planKey] || 0,
      startDate: now,
      endDate,
      active: true,
    });

    res.status(201).json({
      message: "Gimnasio creado correctamente",
      gymId: gym._id,
    });
  } catch (error) {
    console.error("Error creating gym:", error);
    res.status(500).json({ message: "Error al crear el gimnasio" });
  }
});

// ─── Registration Review ────────────────────────────────────
router.put("/gyms/:gymId/registration-review", async (req: AuthRequest, res) => {
  try {
    const { action, rejectionReason } = req.body as {
      action: "approve" | "reject";
      rejectionReason?: string;
    };
    const planPrices = await getPlatformPlanPrices();

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Acción inválida" });
    }

    const gym = await Gym.findById(req.params.gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gimnasio no encontrado" });
    }

    gym.paymentReviewedAt = new Date();
    gym.paymentReviewedBy = req.user.id as any;

    if (action === "approve") {
      gym.onboardingStatus = "approved";
      gym.active = true;
      gym.paymentRejectionReason = undefined;

      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + 1);

      const activeMembership = await Membership.findOne({
        gymId: gym._id,
        active: true,
      });

      if (activeMembership) {
        activeMembership.startDate = now;
        activeMembership.endDate = endDate;
        activeMembership.amount = planPrices[gym.plan] || 0;
        activeMembership.reviewStatus = "approved";
        activeMembership.reviewedAt = now;
        activeMembership.reviewNotes = undefined;
        activeMembership.paymentReference = gym.paymentReference;
        activeMembership.paymentProofUrl = gym.paymentProofUrl;
        await activeMembership.save();
      } else {
        const latestMembership = await Membership.findOne({ gymId: gym._id })
          .sort({ createdAt: -1 })
          .lean();
        if (latestMembership) {
          await Membership.findByIdAndUpdate(latestMembership._id, {
            active: true,
            startDate: now,
            endDate,
            reviewStatus: "approved",
            reviewedAt: now,
            reviewNotes: undefined,
            paymentReference: gym.paymentReference,
            paymentProofUrl: gym.paymentProofUrl,
            amount: planPrices[gym.plan] || 0,
          });
        } else {
          await Membership.create({
            gymId: gym._id,
            plan: gym.plan,
            amount: planPrices[gym.plan] || 0,
            startDate: now,
            endDate,
            active: true,
            paymentReference: gym.paymentReference,
            paymentProofUrl: gym.paymentProofUrl,
            reviewStatus: "approved",
            reviewedAt: now,
          });
        }
      }
    } else {
      gym.onboardingStatus = "rejected";
      gym.active = false;
      gym.paymentRejectionReason = rejectionReason?.trim() || "Comprobante rechazado";

      await Membership.updateMany(
        { gymId: gym._id, active: true },
        {
          active: false,
          endDate: new Date(),
          reviewStatus: "rejected",
          reviewedAt: new Date(),
          reviewNotes: rejectionReason?.trim() || "Comprobante rechazado",
          paymentReference: gym.paymentReference,
          paymentProofUrl: gym.paymentProofUrl,
        },
      );

      await Membership.findOneAndUpdate(
        { gymId: gym._id },
        {
          reviewStatus: "rejected",
          reviewedAt: new Date(),
          reviewNotes: rejectionReason?.trim() || "Comprobante rechazado",
          paymentReference: gym.paymentReference,
          paymentProofUrl: gym.paymentProofUrl,
        },
        { sort: { createdAt: -1 } },
      );
    }

    await gym.save();

    res.json({
      message:
        action === "approve"
          ? "Registro aprobado. Dashboard habilitado."
          : "Registro rechazado. Se requiere un nuevo comprobante.",
      gym: {
        _id: gym._id,
        onboardingStatus: gym.onboardingStatus,
        active: gym.active,
      },
    });
  } catch (error) {
    console.error("Error reviewing registration:", error);
    res.status(500).json({ message: "Error al revisar el registro" });
  }
});

// ─── Reports ─────────────────────────────────────────────────
router.get("/report/gyms-status", async (req, res) => {
  const activos = await Gym.countDocuments({ active: true });
  const inactivos = await Gym.countDocuments({ active: false });
  res.json({ activos, inactivos });
});

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

router.get("/report/clients", async (req, res) => {
  const total = await Client.countDocuments({ isActive: true });
  const porGimnasio = await Client.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$gymId", count: { $sum: 1 } } },
  ]);
  res.json({ total, porGimnasio });
});

// ─── Toggle Gym Active ───────────────────────────────────────
router.put("/gyms/:gymId/active", async (req, res) => {
  try {
    const { active } = req.body;
    const existingGym = await Gym.findById(req.params.gymId).select("onboardingStatus");
    if (!existingGym) {
      return res.status(404).json({ message: "Gimnasio no encontrado" });
    }
    if (active && existingGym.onboardingStatus !== "approved") {
      return res.status(400).json({
        message: "Solo se puede habilitar un gimnasio con registro aprobado",
      });
    }

    const gym = await Gym.findByIdAndUpdate(
      req.params.gymId,
      { active },
      { new: true },
    );
    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });

    const activeMembership = await Membership.findOne({
      gymId: gym._id,
      active: true,
    });

    if (activeMembership) {
      const now = new Date();
      if (active) {
        const endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 1);
        activeMembership.startDate = now;
        activeMembership.endDate = endDate;
      } else {
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

// ─── Reset Admin Password ────────────────────────────────────
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
  if (!admin)
    return res.status(404).json({ message: "Admin no encontrado" });
  res.json({ message: "Contraseña reseteada correctamente" });
});

// ─── List Gyms ───────────────────────────────────────────────
router.get("/gyms", async (req, res) => {
  const gyms = await Gym.find().populate("owner", "name email");
  res.json(gyms);
});

// ─── Admin CRUD ──────────────────────────────────────────────
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
  if (!admin)
    return res.status(404).json({ message: "Admin no encontrado" });
  res.json(admin);
});

// ─── Edit Gym ────────────────────────────────────────────────
router.put("/gyms/:gymId", async (req, res) => {
  try {
    const { name, address, plan } = req.body;
    const planPrices = await getPlatformPlanPrices();
    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (plan && ["basico", "pro", "proplus"].includes(plan)) {
      updateData.plan = plan;
    }
    const gym = await Gym.findByIdAndUpdate(req.params.gymId, updateData, {
      new: true,
    });
    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });

    if (plan && ["basico", "pro", "proplus"].includes(plan)) {
      const planKey = plan as keyof Awaited<ReturnType<typeof getPlatformPlanPrices>>;
      await Membership.updateMany(
        { gymId: gym._id, active: true },
        { active: false, endDate: new Date() },
      );

      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + 1);

      await Membership.create({
        gymId: gym._id,
        plan,
        amount: planPrices[planKey],
        startDate: now,
        endDate,
        active: gym.active,
        reviewStatus: "manual",
        reviewedAt: now,
        reviewNotes: "Actualización manual de plan por superadmin",
      });
    }

    res.json(gym);
  } catch (error) {
    console.error("Error updating gym:", error);
    res.status(500).json({ message: "Error al editar gimnasio" });
  }
});

// ─── Delete Gym (full cascade) ───────────────────────────────
router.delete("/gyms/:gymId", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym)
      return res.status(404).json({ message: "Gimnasio no encontrado" });

    await Promise.all([
      User.deleteMany({ gymId: gym._id }),
      Membership.deleteMany({ gymId: gym._id }),
      Client.deleteMany({ gymId: gym._id }),
      AccessLog.deleteMany({ gymId: gym._id }),
      Payment.deleteMany({ gymId: gym._id }),
      MonthlySnapshot.deleteMany({ gymId: gym._id }),
      Gym.findByIdAndDelete(gym._id),
    ]);

    res.json({ message: "Gimnasio eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting gym:", error);
    res.status(500).json({ message: "Error al eliminar gimnasio" });
  }
});

// ─── Gym Memberships (SaaS history) ─────────────────────────
router.get("/gyms/:gymId/memberships", async (req, res) => {
  const memberships = await Membership.find({ gymId: req.params.gymId })
    .select(
      "plan amount startDate endDate active paymentReference paymentProofUrl reviewStatus reviewedAt reviewNotes createdAt",
    )
    .sort({ createdAt: -1 })
    .lean();
  res.json(memberships);
});

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
