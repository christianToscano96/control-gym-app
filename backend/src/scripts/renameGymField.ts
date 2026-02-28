import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db";

/**
 * Migración: Renombra el campo "gym" a "gymId" en todas las colecciones.
 * Seguro de re-ejecutar (no falla si el campo ya fue renombrado).
 *
 * Uso: npx ts-node src/scripts/renameGymField.ts
 */
async function renameGymField() {
  await connectDB();
  const db = mongoose.connection.db!;

  const collections = ["users", "clients", "payments", "accesslogs", "memberships"];

  for (const col of collections) {
    try {
      const result = await db.collection(col).updateMany(
        { gym: { $exists: true } },
        { $rename: { gym: "gymId" } },
      );
      console.log(
        `[${col}] Renombrados ${result.modifiedCount} documentos (${result.matchedCount} coincidencias)`,
      );
    } catch (err: any) {
      console.error(`[${col}] Error: ${err.message}`);
    }
  }

  console.log("Migración completada");
  process.exit(0);
}

renameGymField().catch((err) => {
  console.error("Migración falló:", err);
  process.exit(1);
});
