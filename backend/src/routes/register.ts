import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { User } from "../models/User";
import { Gym } from "../models/Gym";
import { Membership } from "../models/Membership";
import { getPlatformPlanPrices } from "../utils/planPricing";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/payment-proofs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "proof-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten comprobantes en JPG, PNG, WEBP o PDF"));
  },
});

const buildPaymentReference = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GYM-${Date.now().toString().slice(-6)}-${random}`;
};

const generateUniquePaymentReference = async () => {
  let paymentReference = buildPaymentReference();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await Gym.exists({ paymentReference });
    if (!exists) return paymentReference;
    paymentReference = buildPaymentReference();
    attempts += 1;
  }
  throw new Error("No se pudo generar un ID de pago único");
};

// Registro de gimnasio + admin + plan
router.post("/", async (req, res) => {
  try {
    const { gymName, gymAddress, adminName, adminEmail, adminPassword, plan } =
      req.body;
    if (!["basico", "pro", "proplus"].includes(plan)) {
      return res.status(400).json({ message: "Plan inválido" });
    }
    const planKey = plan as keyof Awaited<ReturnType<typeof getPlatformPlanPrices>>;
    // Validar email único
    const exists = await User.findOne({ email: adminEmail });
    if (exists)
      return res.status(400).json({ message: "El email ya está registrado" });

    const planPrices = await getPlatformPlanPrices();
    const paymentReference = await generateUniquePaymentReference();
    // Crear gimnasio
    const gym = await Gym.create({
      name: gymName,
      address: gymAddress,
      plan,
      active: false,
      onboardingStatus: "pending",
      paymentReference,
      clientsCount: 0,
    });
    // Crear admin
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
    // Crear membresía inicial (1 mes)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + 1); // 1 mes por defecto
    await Membership.create({
      gymId: gym._id,
      plan,
      amount: planPrices[planKey] || 0,
      startDate: now,
      endDate,
      active: false,
      paymentReference,
      reviewStatus: "pending",
    });
    res
      .status(201)
      .json({
        message: "Cuenta creada. Falta confirmar la transferencia.",
        gymId: gym._id,
        paymentReference,
        onboardingStatus: "pending",
      });
  } catch (err) {
    res.status(500).json({ message: "Error en el registro", error: err });
  }
});

router.get("/plan-prices", async (req, res) => {
  try {
    const planPrices = await getPlatformPlanPrices();
    res.json({ planPrices });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener precios de planes", error: err });
  }
});

router.get("/:gymId/status", async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId)
      .select(
        "name plan onboardingStatus paymentReference paymentProofUrl paymentProofUploadedAt paymentRejectionReason",
      )
      .lean();
    const planPrices = await getPlatformPlanPrices();
    if (!gym) {
      return res.status(404).json({ message: "Gimnasio no encontrado" });
    }
    res.json({
      gymId: gym._id,
      gymName: gym.name,
      plan: gym.plan,
      onboardingStatus: gym.onboardingStatus,
      paymentReference: gym.paymentReference,
      transferAmount: planPrices[gym.plan] || 0,
      paymentProofUrl: gym.paymentProofUrl || null,
      paymentProofUploadedAt: gym.paymentProofUploadedAt || null,
      paymentRejectionReason: gym.paymentRejectionReason || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el estado", error: err });
  }
});

router.post("/:gymId/proof", upload.single("proof"), async (req, res) => {
  try {
    const { paymentReference } = req.body;
    if (!paymentReference) {
      return res.status(400).json({ message: "El ID de pago es obligatorio" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Debe adjuntar un comprobante" });
    }

    const gym = await Gym.findById(req.params.gymId);
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });

    if (gym.paymentReference !== paymentReference) {
      return res.status(400).json({ message: "ID de pago inválido" });
    }
    if (gym.onboardingStatus === "approved") {
      return res.status(400).json({ message: "La cuenta ya fue aprobada" });
    }

    if (gym.paymentProofUrl) {
      const normalizedRelativePath = gym.paymentProofUrl.replace(/^\/+/, "");
      const oldFilePath = path.join(__dirname, "../../", normalizedRelativePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    gym.paymentProofUrl = `/uploads/payment-proofs/${req.file.filename}`;
    gym.paymentProofUploadedAt = new Date();
    gym.onboardingStatus = "pending";
    gym.paymentRejectionReason = undefined;
    await gym.save();

    await Membership.findOneAndUpdate(
      { gymId: gym._id },
      {
        paymentReference,
        paymentProofUrl: gym.paymentProofUrl,
        reviewStatus: "pending",
        reviewNotes: undefined,
      },
      { sort: { createdAt: -1 } },
    );

    res.json({
      message: "Comprobante subido. Tu cuenta quedo pendiente de aprobación.",
      onboardingStatus: gym.onboardingStatus,
      paymentProofUrl: gym.paymentProofUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "Error al subir comprobante", error: err });
  }
});

export default router;
