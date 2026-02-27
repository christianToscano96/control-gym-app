import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../db";
import { Client } from "../models/Client";
import { calculateEndDate } from "../utils/membershipUtils";

async function migrate() {
  await connectDB();

  // Paso 1: Renombrar campo "active" a "isActive" en documentos existentes
  const db = mongoose.connection.db!;
  const collection = db.collection("clients");
  const renameResult = await collection.updateMany(
    { active: { $exists: true } },
    { $rename: { active: "isActive" } }
  );
  console.log(
    `Campo renombrado: ${renameResult.modifiedCount} documentos actualizados (active -> isActive)`
  );

  // Paso 2: Buscar clientes que tienen startDate pero no endDate
  const clients = await Client.find({
    endDate: { $exists: false },
    startDate: { $exists: true },
  });

  console.log(`Encontrados ${clients.length} clientes sin endDate para migrar`);

  let updated = 0;
  let expired = 0;

  for (const client of clients) {
    const endDate = calculateEndDate(client.startDate, client.selected_period);
    client.endDate = endDate;

    // Marcar como inactivo si ya expiró
    if (endDate < new Date() && client.isActive) {
      client.isActive = false;
      expired++;
    }

    await client.save();
    updated++;
  }

  console.log(
    `Migración completa: ${updated} clientes actualizados, ${expired} marcados como inactivos`
  );
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
