import { Client } from "../models/Client";
import mongoose from "mongoose";

/**
 * Marca como inactivos todos los clientes cuyo endDate ya pasó.
 * Operación atómica e idempotente por gimnasio.
 */
export async function expireClientsForGym(
  gymId: string | mongoose.Types.ObjectId
): Promise<number> {
  const now = new Date();
  const result = await Client.updateMany(
    {
      gym: gymId,
      isActive: true,
      endDate: { $exists: true, $lt: now },
    },
    { $set: { isActive: false } }
  );
  return result.modifiedCount;
}
