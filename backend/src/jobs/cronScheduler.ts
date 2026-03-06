import cron from "node-cron";
import { generateAllSnapshots } from "./snapshotJob";
import { Gym } from "../models/Gym";
import { expireClientsForGym } from "../utils/expireClients";

/**
 * Inicia todos los cron jobs programados.
 * Llamar después de conectar a la BD.
 */
export function startCronJobs(): void {
  // 1ro de cada mes a las 02:00 — genera snapshot del mes ANTERIOR
  cron.schedule("0 2 1 * *", async () => {
    console.log("[Cron] Snapshot mensual iniciado");

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed

    if (month === 0) {
      year -= 1;
      month = 12;
    }

    try {
      const result = await generateAllSnapshots(year, month);
      console.log(
        `[Cron] Snapshot completado: ${result.processed} gyms, ${result.errors.length} errores`,
      );
    } catch (err) {
      console.error("[Cron] Snapshot mensual falló:", err);
    }
  });

  console.log("[Cron] Snapshot mensual programado (1ro de cada mes a las 02:00)");

  // Cada día a las 03:00 — expirar clientes con membresía vencida
  cron.schedule("0 3 * * *", async () => {
    console.log("[Cron] Expiración de membresías iniciada");
    try {
      const gyms = await Gym.find({ active: true }).select("_id").lean();
      let totalExpired = 0;
      for (const gym of gyms) {
        const count = await expireClientsForGym(gym._id);
        totalExpired += count;
      }
      console.log(
        `[Cron] Expiración completada: ${totalExpired} clientes expirados en ${gyms.length} gyms`,
      );
    } catch (err) {
      console.error("[Cron] Expiración de membresías falló:", err);
    }
  });

  console.log("[Cron] Expiración de membresías programada (todos los días a las 03:00)");
}
