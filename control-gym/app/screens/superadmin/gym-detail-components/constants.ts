export const planConfig: Record<string, { label: string; color: string; bg: string }> =
  {
    basico: { label: "Basico", color: "#6366F1", bg: "#EEF2FF" },
    pro: { label: "Pro", color: "#7C3AED", bg: "#F5F3FF" },
    proplus: { label: "Pro+", color: "#DB2777", bg: "#FDF2F8" },
  };

export const planOptions = [
  { key: "basico", label: "Basico" },
  { key: "pro", label: "Pro" },
  { key: "proplus", label: "Pro+" },
] as const;

export const reviewStatusConfig = (colors: {
  success: string;
  error: string;
  textSecondary: string;
}) => ({
  pending: { label: "Pendiente", color: "#F59E0B" },
  approved: { label: "Aprobado", color: colors.success },
  rejected: { label: "Rechazado", color: colors.error },
  manual: { label: "Manual", color: colors.textSecondary },
});
