import { AuditLog } from "../models/AuditLog";
// Middleware para registrar acción
export const logAction = (action: string, details?: any) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      await AuditLog.create({
        user: req.user.id,
        role: req.user.role,
        action,
        details,
      });
    }
    next();
  };
};
// Permisos granulares por rol
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "Permiso denegado para este rol." });
  };
};
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token requerido" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Solo admins pueden acceder." });
};

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ message: "Solo superadmins pueden acceder." });
};
