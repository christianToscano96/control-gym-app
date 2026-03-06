import { z } from "zod";

const VALID_PERIODS = [
  "1 dia",
  "7 dias",
  "15 dias",
  "mensual",
  "3 meses",
  "6 meses",
  "año",
] as const;

const PAYMENT_METHODS = ["efectivo", "transferencia", "tarjeta"] as const;

export const createClientSchema = z.object({
  firstName: z
    .string({ error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  lastName: z
    .string({ error: "El apellido es obligatorio" })
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .trim(),
  email: z
    .string()
    .email("Email inválido")
    .trim()
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  dni: z.string().trim().optional().or(z.literal("")),
  instagramLink: z.string().trim().optional().or(z.literal("")),
  membershipType: z.string().trim().optional(),
  selected_period: z.enum(VALID_PERIODS, {
    error: "Período inválido",
  }).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: "Método de pago inválido",
  }).optional(),
  startDate: z.coerce.date().optional(),
  amount: z.number().min(0, "El monto no puede ser negativo").optional(),
});
