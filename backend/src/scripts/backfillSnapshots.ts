import "dotenv/config";
import { connectDB } from "../db";
import { Gym } from "../models/Gym";
import { Payment } from "../models/Payment";
import { generateSnapshotForGym } from "../jobs/snapshotJob";

/**
 * Backfill: genera snapshots mensuales desde el primer pago
 * hasta el mes anterior para todos los gimnasios.
 *
 * Uso: npx ts-node src/scripts/backfillSnapshots.ts
 */
async function backfill() {
  await connectDB();

  const gyms = await Gym.find({});
  console.log(`Encontrados ${gyms.length} gimnasios para backfill`);

  for (const gym of gyms) {
    const earliestPayment = await Payment.findOne({ gymId: gym._id })
      .sort({ date: 1 })
      .lean();

    if (!earliestPayment) {
      console.log(`  Gym "${gym.name}" (${gym._id}): Sin pagos, saltando`);
      continue;
    }

    const startDate = new Date(earliestPayment.date);
    const now = new Date();

    let year = startDate.getFullYear();
    let month = startDate.getMonth() + 1;

    let endYear = now.getFullYear();
    let endMonth = now.getMonth();
    if (endMonth === 0) {
      endYear -= 1;
      endMonth = 12;
    }

    console.log(
      `  Gym "${gym.name}" (${gym._id}): Backfill ${year}-${String(month).padStart(2, "0")} a ${endYear}-${String(endMonth).padStart(2, "0")}`,
    );

    let count = 0;
    while (year < endYear || (year === endYear && month <= endMonth)) {
      try {
        await generateSnapshotForGym(gym._id, year, month);
        count++;
      } catch (err: any) {
        console.error(
          `    Error ${year}-${String(month).padStart(2, "0")}: ${err.message}`,
        );
      }

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    console.log(`    Generados ${count} snapshots`);
  }

  console.log("Backfill completado");
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill falló:", err);
  process.exit(1);
});
