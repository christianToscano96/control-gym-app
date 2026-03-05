export interface SuperAdminGym {
  _id: string;
  name: string;
  address: string;
  plan: "basico" | "pro" | "proplus";
  active: boolean;
  onboardingStatus: "pending" | "approved" | "rejected";
  paymentReference?: string | null;
  hasPaymentProof?: boolean;
  clientsCount: number;
}

export interface SuperAdminEntry {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  active: boolean;
  gym: SuperAdminGym | null;
}

export interface ExpiringGym {
  gymId: string;
  gymName: string;
  plan: string;
  endDate: string;
  daysLeft: number;
}

export interface SuperAdminSummary {
  totalGyms: number;
  activeGyms: number;
  inactiveGyms: number;
  pendingGyms: number;
  totalClients: number;
  totalPlatformRevenue: number;
  totalGymRevenue: number;
  todayCheckIns: number;
  planDistribution: {
    basico: number;
    pro: number;
    proplus: number;
  };
  kpis?: {
    platformRevenueThisMonth: number;
    platformRevenueLastMonth: number;
    platformRevenueDeltaPct: number;
    newGymsThisMonth: number;
    newGymsLastMonth: number;
    newGymsDelta: number;
  };
  expiringGyms: ExpiringGym[];
}

export interface SuperAdminOverview {
  summary: SuperAdminSummary;
  admins: SuperAdminEntry[];
}

export interface GymDetailMembership {
  plan: "basico" | "pro" | "proplus";
  amount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  paymentReference?: string;
  paymentProofUrl?: string;
  reviewStatus?: "pending" | "approved" | "rejected" | "manual";
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface GymDetailAdmin {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface GymDetailResponse {
  gym: {
    _id: string;
    name: string;
    address: string;
    plan: "basico" | "pro" | "proplus";
    active: boolean;
    onboardingStatus: "pending" | "approved" | "rejected";
    paymentReference?: string | null;
    paymentProofUrl?: string | null;
    paymentProofUploadedAt?: string | null;
    paymentRejectionReason?: string | null;
    createdAt: string;
  };
  admin: GymDetailAdmin | null;
  membership: GymDetailMembership | null;
  clientsCount: number;
  activeClientsCount: number;
  platformRevenue: number;
  gymRevenue: number;
  monthlyGymRevenue: number;
  todayCheckIns: number;
  todayDenied: number;
  staffCount: number;
}

export interface GymClient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: "basico" | "pro" | "proplus";
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface GymClientsResponse {
  clients: GymClient[];
  total: number;
}

export interface GymPayment {
  _id: string;
  clientName: string;
  amount: number;
  method: string;
  period?: string;
  status: "completed" | "pending" | "failed";
  date: string;
}

export interface GymPaymentsResponse {
  payments: GymPayment[];
  monthlyRevenue: number;
  totalRevenue: number;
}

export interface GymAccessLog {
  _id: string;
  clientName: string;
  membershipType: string;
  method: string;
  status: "allowed" | "denied";
  denyReason?: string;
  date: string;
}

export interface GymAccessLogsResponse {
  logs: GymAccessLog[];
  todayAllowed: number;
  todayDenied: number;
}

export interface GymStaffMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  active: boolean;
  role: string;
}

export interface CreateGymData {
  gymName: string;
  gymAddress: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plan: "basico" | "pro" | "proplus";
}
