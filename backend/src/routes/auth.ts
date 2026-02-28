import { Router } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
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
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });
  const token = jwt.sign(
    { id: user._id, role: user.role, gymId: user.gymId },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" },
  );
  res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, gymId: user.gymId },
  });
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
