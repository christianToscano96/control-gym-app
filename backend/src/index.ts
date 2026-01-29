import express from "express";
import { connectDB } from "./db";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import clientRoutes from "./routes/client";
import authRoutes from "./routes/auth";
import registerRoutes from "./routes/register";
import membershipRoutes from "./routes/membership";
import superadminRoutes from "./routes/superadmin";
import adminRoutes from "./routes/admin";
import passwordRoutes from "./routes/password";
import paymentRoutes from "./routes/payment";
import staffRoutes from "./routes/staff";
import auditRoutes from "./routes/audit";
import accessRoutes from "./routes/access";
import exportRoutes from "./routes/export";
import userRoutes from "./routes/user";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Servir archivos estáticos (avatares)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Registro de gimnasio + admin + plan
app.use("/api/register", registerRoutes);

// Cambiar plan (upgrade/downgrade)
app.use("/api/membership", membershipRoutes);

// Rutas para SuperAdmin
app.use("/api/superadmin", superadminRoutes);

// Rutas para admin (ver membresía y plan actual)
app.use("/api/admin", adminRoutes);

// Rutas para recuperación y cambio de contraseña
app.use("/api/password", passwordRoutes);

// Rutas para pagos y renovaciones
app.use("/api/payment", paymentRoutes);

// Rutas para empleados y entrenadores
app.use("/api/staff", staffRoutes);

// Rutas para auditoría y logs
app.use("/api/audit", auditRoutes);

// Rutas para scanner/acceso físico
app.use("/api/access", accessRoutes);

// Rutas para exportar datos (CSV, PDF)
app.use("/api/export", exportRoutes);

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas para clientes de gimnasio
app.use("/api/clients", clientRoutes);

// Rutas para usuarios
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API Gym SaaS funcionando");
});

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });
});
