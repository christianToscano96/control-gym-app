// ─── Query Key Factory ──────────────────────────────────────────
// Centraliza todas las query keys para consistencia en invalidación y cache.

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    detail: (id: string) => ["clients", id] as const,
    payments: (id: string) => ["clients", id, "payments"] as const,
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
    membershipDistribution: ["dashboard", "membershipDistribution"] as const,
    expiringMemberships: ["dashboard", "expiringMemberships"] as const,
  },
  access: {
    recent: ["access", "recent"] as const,
  },
  profile: {
    current: ["profile"] as const,
  },
  reports: {
    all: ["reports"] as const,
    filtered: (filters: Record<string, any>) =>
      ["reports", filters] as const,
  },
  emailConfig: {
    current: ["emailConfig"] as const,
  },
  periodPricing: {
    current: ["periodPricing"] as const,
  },
  payments: {
    all: ["payments"] as const,
  },
  gymSubscription: {
    active: ["gymSubscription", "active"] as const,
  },
  gymStatus: {
    current: ["gymStatus"] as const,
  },
  superadmin: {
    overview: ["superadmin", "overview"] as const,
    gymDetail: (id: string) => ["superadmin", "gym", id] as const,
    membershipHistory: (id: string) =>
      ["superadmin", "gym", id, "memberships"] as const,
  },
};
