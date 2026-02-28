import mongoose from "mongoose";
import { Gym } from "../models/Gym";
import { Payment } from "../models/Payment";
import { Client } from "../models/Client";
import { AccessLog } from "../models/AccessLog";
import { MonthlySnapshot } from "../models/MonthlySnapshot";

/**
 * Genera (o sobreescribe) un snapshot mensual para un gimnasio.
 */
export async function generateSnapshotForGym(
  gymId: mongoose.Types.ObjectId | string,
  year: number,
  month: number,
): Promise<void> {
  const gid = new mongoose.Types.ObjectId(gymId);

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 1);

  // 1. Revenue
  const revenueResult = await Payment.aggregate([
    {
      $match: {
        gymId: gid,
        date: { $gte: startOfMonth, $lt: endOfMonth },
        status: "completed",
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // 2. Total clientes activos al final del mes
  const totalClients = await Client.countDocuments({
    gymId: gid,
    createdAt: { $lt: endOfMonth },
    $or: [
      { endDate: { $gte: endOfMonth } },
      { endDate: { $exists: false } },
    ],
  });

  // 3. Check-ins del mes
  const totalCheckIns = await AccessLog.countDocuments({
    gymId: gid,
    date: { $gte: startOfMonth, $lt: endOfMonth },
  });

  // 4. Clientes nuevos
  const newClients = await Client.countDocuments({
    gymId: gid,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  });

  // 5. Distribución de membresías
  const distributionResult = await Client.aggregate([
    {
      $match: {
        gymId: gid,
        createdAt: { $lt: endOfMonth },
        $or: [
          { endDate: { $gte: endOfMonth } },
          { endDate: { $exists: false } },
        ],
      },
    },
    { $group: { _id: "$membershipType", count: { $sum: 1 } } },
  ]);

  const membershipDistribution = { basico: 0, pro: 0, proplus: 0 };
  for (const item of distributionResult) {
    if (item._id in membershipDistribution) {
      membershipDistribution[item._id as keyof typeof membershipDistribution] =
        item.count;
    }
  }

  // 6. Clientes que se volvieron inactivos este mes
  const churnedClients = await Client.countDocuments({
    gymId: gid,
    isActive: false,
    endDate: { $gte: startOfMonth, $lt: endOfMonth },
  });

  // 7. Revenue promedio por cliente
  const averageRevenuePerClient =
    totalClients > 0 ? Math.round((revenue / totalClients) * 100) / 100 : 0;

  // Upsert (idempotente)
  await MonthlySnapshot.findOneAndUpdate(
    { gymId: gid, year, month },
    {
      $set: {
        revenue,
        totalClients,
        totalCheckIns,
        newClients,
        membershipDistribution,
        averageRevenuePerClient,
        churnedClients,
      },
    },
    { upsert: true, new: true },
  );
}

/**
 * Genera snapshots para TODOS los gyms activos.
 */
export async function generateAllSnapshots(
  year: number,
  month: number,
): Promise<{ processed: number; errors: string[] }> {
  const gyms = await Gym.find({ active: true });
  const errors: string[] = [];
  let processed = 0;

  for (const gym of gyms) {
    try {
      await generateSnapshotForGym(gym._id, year, month);
      processed++;
    } catch (err: any) {
      errors.push(`Gym ${gym._id} (${gym.name}): ${err.message}`);
    }
  }

  console.log(
    `[Snapshots] Generados ${processed}/${gyms.length} snapshots para ${year}-${String(month).padStart(2, "0")}`,
  );
  if (errors.length > 0) {
    console.error("[Snapshots] Errores:", errors);
  }

  return { processed, errors };
}
