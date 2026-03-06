import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "El email es obligatorio" })
    .email("Email inválido")
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "El email es obligatorio" })
    .email("Email inválido")
    .trim()
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ error: "El email es obligatorio" })
    .email("Email inválido")
    .trim()
    .toLowerCase(),
  code: z
    .string({ error: "El código es obligatorio" })
    .length(6, "El código debe tener 6 dígitos"),
  newPassword: z
    .string({ error: "La nueva contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});
