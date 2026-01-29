/**
 * Calcula la fecha de expiración de la membresía basándose en el período seleccionado
 */
export const calculateExpirationDate = (
  membershipStartDate: string | undefined,
  createdAt: string | undefined,
  selectedPeriod: string | undefined
): Date | null => {
  let startDate: Date;

  if (membershipStartDate) {
    startDate = new Date(membershipStartDate);
  } else if (createdAt) {
    startDate = new Date(createdAt);
  } else {
    return null;
  }

  const period = selectedPeriod?.toLowerCase() || "";
  const expirationDate = new Date(startDate.getTime());

  if (period.includes("1 día") || period.includes("diario") || period.includes("1 dia")) {
    expirationDate.setDate(expirationDate.getDate() + 1);
  } else if (
    period.includes("15 días") ||
    period.includes("quincenal") ||
    period.includes("15 dias")
  ) {
    expirationDate.setDate(expirationDate.getDate() + 15);
  } else if (period.includes("mensual") || period.includes("1 mes")) {
    addMonths(expirationDate, 1);
  } else if (period.includes("3 meses") || period.includes("trimestral")) {
    addMonths(expirationDate, 3);
  } else if (period.includes("6 meses") || period.includes("semestral")) {
    addMonths(expirationDate, 6);
  } else if (
    period.includes("año") ||
    period.includes("anual") ||
    period.includes("12 meses")
  ) {
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  } else {
    // Por defecto, asumimos mensual
    addMonths(expirationDate, 1);
  }

  return expirationDate;
};

/**
 * Agrega meses a una fecha, manejando correctamente los días que no existen
 */
const addMonths = (date: Date, months: number): void => {
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
    date.setDate(0); // Último día del mes anterior (el mes que queremos)
  }
};

/**
 * Verifica si la membresía está próxima a vencer (5 días o menos)
 */
export const isExpiringSoon = (expirationDate: Date | null): boolean => {
  if (!expirationDate) return false;
  const today = new Date();
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiration <= 5 && daysUntilExpiration > 0;
};

/**
 * Verifica si la membresía ha expirado
 */
export const hasExpired = (expirationDate: Date | null): boolean => {
  if (!expirationDate) return false;
  return expirationDate < new Date();
};

/**
 * Formatea una fecha al formato español
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return "No disponible";
  try {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};
