import { Router } from "express";
import { User } from "../models/User";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

// Obtener todos los usuarios (admin: solo su gym, superadmin: todos)
router.get("/", authenticateJWT, requireRole(["admin", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    let users;
    if (req.user.role === "superadmin") {
      users = await User.find();
    } else {
      users = await User.find({ gymId: req.user.gymId });
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios", error: err });
  }
});

// Crear usuario (admin: solo su gym, superadmin: cualquier gym)
router.post("/", authenticateJWT, requireRole(["admin", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, gym, active } = req.body;
    const gymId = req.user.role === "superadmin" ? gym : req.user.gymId;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, gymId, active });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al crear usuario", error: err });
  }
});

// Editar usuario
router.put("/:id", authenticateJWT, requireRole(["admin", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const filter = req.user.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, gymId: req.user.gymId };
    const user = await User.findOneAndUpdate(filter, updateData, { new: true });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al editar usuario", error: err });
  }
});

// Eliminar usuario
router.delete("/:id", authenticateJWT, requireRole(["admin", "superadmin"]), async (req: AuthRequest, res) => {
  try {
    const filter = req.user.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, gymId: req.user.gymId };
    const user = await User.findOneAndDelete(filter);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar usuario", error: err });
  }
});

export default router;
