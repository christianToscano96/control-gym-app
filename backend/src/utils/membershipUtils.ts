/**
 * Calcula la fecha de fin de membresía a partir de la fecha de inicio y el período seleccionado.
 * Espejo de la lógica en control-gym/utils/membershipUtils.ts
 */
export function calculateEndDate(
  startDate: Date,
  selectedPeriod: string | undefined
): Date {
  const period = (selectedPeriod || "").toLowerCase();
  const endDate = new Date(startDate.getTime());

  if (
    period.includes("1 día") ||
    period.includes("diario") ||
    period.includes("1 dia")
  ) {
    endDate.setDate(endDate.getDate() + 1);
  } else if (
    period.includes("15 días") ||
    period.includes("quincenal") ||
    period.includes("15 dias")
  ) {
    endDate.setDate(endDate.getDate() + 15);
  } else if (period.includes("mensual") || period.includes("1 mes")) {
    addMonths(endDate, 1);
  } else if (period.includes("3 meses") || period.includes("trimestral")) {
    addMonths(endDate, 3);
  } else if (period.includes("6 meses") || period.includes("semestral")) {
    addMonths(endDate, 6);
  } else if (
    period.includes("año") ||
    period.includes("anual") ||
    period.includes("12 meses")
  ) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    // Por defecto: mensual
    addMonths(endDate, 1);
  }

  return endDate;
}

function addMonths(date: Date, months: number): void {
  const currentDay = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  let newMonth = currentMonth + months;
  let newYear = currentYear;

  while (newMonth > 11) {
    newMonth -= 12;
    newYear++;
  }

  date.setFullYear(newYear);
  date.setMonth(newMonth);

  // Ajustar el día si no existe en el nuevo mes (ej: 31 de enero -> 28/29 de febrero)
  if (date.getDate() !== currentDay) {
    date.setDate(0);
  }
}
