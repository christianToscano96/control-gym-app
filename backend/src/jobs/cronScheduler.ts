import cron from "node-cron";
import { generateAllSnapshots } from "./snapshotJob";

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
}
