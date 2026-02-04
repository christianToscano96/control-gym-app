import { Router } from "express";
import { authenticateJWT, requireAdmin, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configuración de multer para subida de avatares
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
    cb(null, "staff-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Crear empleado (solo admin)
// TODO: Implementar entrenador en el futuro
router.post(
  "/",
  authenticateJWT,
  requireAdmin,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    try {
      const { name, email, password, role, phone } = req.body;

      // Validaciones
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          message: "Todos los campos obligatorios deben ser proporcionados",
        });
      }

      // Solo empleado por ahora, entrenador para futura implementación
      if (!["empleado" /* , "entrenador" */].includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email inválido" });
      }

      // Validar que el password tenga al menos 6 caracteres
      if (password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      // Verificar si el email ya existe
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }

      // Hash del password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Preparar datos del usuario
      const userData: any = {
        name,
        email,
        password: hashedPassword,
        role,
        gym: req.user.gym,
        active: true,
      };

      // Agregar teléfono si se proporciona
      if (phone) {
        userData.phone = phone;
      }

      // Agregar avatar si se subió
      if (req.file) {
        userData.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Crear usuario
      const user = await User.create(userData);

      // Retornar usuario sin el password
      const { password: _, ...userResponse } = user.toObject();

      res.status(201).json({
        message: "Staff creado exitosamente",
        user: userResponse,
      });
    } catch (error: any) {
      console.error("Error al crear staff:", error);
      res.status(500).json({
        message: "Error al crear el staff",
        error: error.message,
      });
    }
  },
);

// Listar empleados del gimnasio
// TODO: Agregar entrenadores en el futuro
router.get(
  "/",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const gymId = req.user.gym;
      const staff = await User.find({
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
      })
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        count: staff.length,
        staff,
      });
    } catch (error: any) {
      console.error("Error al obtener staff:", error);
      res.status(500).json({
        message: "Error al obtener el personal",
        error: error.message,
      });
    }
  },
);

// Obtener un staff por ID
router.get(
  "/:id",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const gymId = req.user.gym;

      const staff = await User.findOne({
        _id: id,
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
      }).select("-password");

      if (!staff) {
        return res.status(404).json({ message: "Staff no encontrado" });
      }

      res.json(staff);
    } catch (error: any) {
      console.error("Error al obtener staff:", error);
      res.status(500).json({
        message: "Error al obtener el staff",
        error: error.message,
      });
    }
  },
);

// Actualizar staff
router.put(
  "/:id",
  authenticateJWT,
  requireAdmin,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role, active } = req.body;
      const gymId = req.user.gym;

      // Buscar el staff
      const staff = await User.findOne({
        _id: id,
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
      });

      if (!staff) {
        return res.status(404).json({ message: "Staff no encontrado" });
      }

      // Validar email si se está actualizando
      if (email && email !== staff.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Email inválido" });
        }

        const emailExists = await User.findOne({ email, _id: { $ne: id } });
        if (emailExists) {
          return res
            .status(400)
            .json({ message: "El email ya está registrado" });
        }
        staff.email = email;
      }

      // Validar rol (solo empleado por ahora)
      if (role && !["empleado" /* , "entrenador" */].includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Actualizar campos
      if (name) staff.name = name;
      if (phone !== undefined) staff.phone = phone;
      if (role) staff.role = role;
      if (active !== undefined) staff.active = active;

      // Actualizar avatar si se subió uno nuevo
      if (req.file) {
        // Eliminar avatar anterior si existe
        if (staff.avatar) {
          const oldAvatarPath = path.join(__dirname, "../..", staff.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
        staff.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      await staff.save();

      const { password: _, ...staffResponse } = staff.toObject();

      res.json({
        message: "Staff actualizado exitosamente",
        user: staffResponse,
      });
    } catch (error: any) {
      console.error("Error al actualizar staff:", error);
      res.status(500).json({
        message: "Error al actualizar el staff",
        error: error.message,
      });
    }
  },
);

// Cambiar contraseña del staff
router.patch(
  "/:id/password",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const gymId = req.user.gym;

      if (!password || password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      const staff = await User.findOne({
        _id: id,
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
      });

      if (!staff) {
        return res.status(404).json({ message: "Staff no encontrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      staff.password = hashedPassword;
      await staff.save();

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      res.status(500).json({
        message: "Error al cambiar la contraseña",
        error: error.message,
      });
    }
  },
);

// Activar/desactivar staff
router.patch(
  "/:id/toggle-status",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const gymId = req.user.gym;

      const staff = await User.findOne({
        _id: id,
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
      });

      if (!staff) {
        return res.status(404).json({ message: "Staff no encontrado" });
      }

      staff.active = !staff.active;
      await staff.save();

      const { password: _, ...staffResponse } = staff.toObject();

      res.json({
        message: `Staff ${staff.active ? "activado" : "desactivado"} exitosamente`,
        user: staffResponse,
      });
    } catch (error: any) {
      console.error("Error al cambiar estado del staff:", error);
      res.status(500).json({
        message: "Error al cambiar el estado",
        error: error.message,
      });
    }
  },
);

// Eliminar staff (soft delete)
router.delete(
  "/:id",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const gymId = req.user.gym;

      const staff = await User.findOne({
        _id: id,
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
      });

      if (!staff) {
        return res.status(404).json({ message: "Staff no encontrado" });
      }

      // Desactivar en lugar de eliminar
      staff.active = false;
      await staff.save();

      res.json({ message: "Staff eliminado exitosamente" });
    } catch (error: any) {
      console.error("Error al eliminar staff:", error);
      res.status(500).json({
        message: "Error al eliminar el staff",
        error: error.message,
      });
    }
  },
);

// Buscar staff
router.get(
  "/search/:query",
  authenticateJWT,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { query } = req.params;
      const gymId = req.user.gym;

      const staff = await User.find({
        gym: gymId,
        role: { $in: ["empleado" /* , "entrenador" */] },
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
        ],
      }).select("-password");

      res.json({
        count: staff.length,
        staff,
      });
    } catch (error: any) {
      console.error("Error al buscar staff:", error);
      res.status(500).json({
        message: "Error al buscar el staff",
        error: error.message,
      });
    }
  },
);

export default router;
