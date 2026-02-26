// ─── Query Key Factory ──────────────────────────────────────────
// Centraliza todas las query keys para consistencia en invalidación y cache.

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    detail: (id: string) => ["clients", id] as const,
  },
  staff: {
    all: ["staff"] as const,
    detail: (id: string) => ["staff", id] as const,
    search: (query: string) => ["staff", "search", query] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    weeklyAttendance: ["dashboard", "weeklyAttendance"] as const,
    activityRate: ["dashboard", "activityRate"] as const,
  },
  access: {
    recent: ["access", "recent"] as const,
  },
  profile: {
    current: ["profile"] as const,
  },
  reports: {
    all: ["reports"] as const,
  },
  emailConfig: {
    current: ["emailConfig"] as const,
  },
};
