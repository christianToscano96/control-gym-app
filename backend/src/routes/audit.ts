import { Router } from "express";
import { authenticateJWT, requireSuperAdmin } from "../middleware/auth";
import { AuditLog } from "../models/AuditLog";

const router = Router();

// Consultar logs de acciones (solo SuperAdmin)
router.get("/", authenticateJWT, requireSuperAdmin, async (req, res) => {
  const logs = await AuditLog.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(logs);
});

export default router;
