import { Router } from "express";
import { User } from "../models/User";
import { Gym } from "../models/Gym";
import { RefreshToken } from "../models/RefreshToken";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configuración de multer para subir avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/avatars");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)"));
    }
  },
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

  // Check gym active status for admin users
  let gymActive = true;
  let onboardingStatus: "pending" | "approved" | "rejected" | undefined;
  if (user.role === "admin" && user.gymId) {
    const gym = await Gym.findById(user.gymId)
      .select("active onboardingStatus paymentReference paymentProofUrl paymentRejectionReason")
      .lean();

    onboardingStatus = gym?.onboardingStatus as
      | "pending"
      | "approved"
      | "rejected"
      | undefined;

    if (onboardingStatus === "pending") {
      return res.status(403).json({
        code: "ACCOUNT_PENDING",
        message:
          "Tu cuenta está pendiente de confirmación. Subí el comprobante y espera aprobación.",
        onboardingStatus,
        gymId: user.gymId,
        paymentReference: gym?.paymentReference || null,
        paymentProofUrl: gym?.paymentProofUrl || null,
      });
    }

    if (onboardingStatus === "rejected") {
      return res.status(403).json({
        code: "ACCOUNT_REJECTED",
        message:
          gym?.paymentRejectionReason ||
          "Tu comprobante fue rechazado. Subí uno nuevo para continuar.",
        onboardingStatus,
        gymId: user.gymId,
        paymentReference: gym?.paymentReference || null,
        paymentProofUrl: gym?.paymentProofUrl || null,
      });
    }

    gymActive = gym?.active ?? false;
  }

  // Access token (short-lived)
  const token = jwt.sign(
    { id: user._id, role: user.role, gymId: user.gymId },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" },
  );

  // Refresh token (long-lived, stored in DB)
  const refreshTokenValue = crypto.randomBytes(64).toString("hex");
  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  res.json({
    token,
    refreshToken: refreshTokenValue,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      gymId: user.gymId,
      gymActive,
      onboardingStatus: onboardingStatus || "approved",
    },
  });
});

// Refresh access token using refresh token
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token requerido" });
  }

  try {
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await stored.deleteOne();
      return res.status(401).json({ message: "Refresh token inválido o expirado" });
    }

    const user = await User.findById(stored.userId);
    if (!user || !user.active) {
      await stored.deleteOne();
      return res.status(401).json({ message: "Usuario no encontrado o inactivo" });
    }

    // Issue new access token
    const newToken = jwt.sign(
      { id: user._id, role: user.role, gymId: user.gymId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    stored.token = newRefreshToken;
    stored.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await stored.save();

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: "Error al refrescar token" });
  }
});

// Check gym active status (lightweight polling endpoint)
router.get("/gym-status", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user.gymId) {
      return res.json({ active: true });
    }
    const gym = await Gym.findById(req.user.gymId).select("active").lean();
    res.json({ active: gym?.active ?? false });
  } catch (err) {
    res.status(500).json({ message: "Error al verificar estado", active: false });
  }
});

// Obtener perfil del usuario autenticado
router.get("/profile", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener perfil", error: err });
  }
});

// Actualizar perfil del usuario autenticado
router.put("/profile", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { name, phone } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar perfil", error: err });
  }
});

// Subir avatar del usuario autenticado
router.post(
  "/profile/avatar",
  authenticateJWT,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó imagen" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Eliminar avatar anterior si existe
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, "../../", user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Guardar la ruta relativa del nuevo avatar
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarPath;
      await user.save();

      res.json({
        message: "Avatar actualizado correctamente",
        avatar: avatarPath,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Error al subir avatar", error: err });
    }
  },
);

export default router;
