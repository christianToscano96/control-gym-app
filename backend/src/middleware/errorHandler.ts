import { Request, Response, NextFunction } from "express";

/**
 * Global error handler — catches unhandled errors and returns
 * a safe response without leaking internal details.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Unhandled error:", err);

  // Multer file-size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "El archivo es demasiado grande." });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Datos inválidos.", errors: Object.keys(err.errors) });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID o parámetro inválido." });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Error interno del servidor.";

  res.status(status).json({ message });
};
