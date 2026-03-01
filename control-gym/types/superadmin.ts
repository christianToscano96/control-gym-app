export interface SuperAdminGym {
  _id: string;
  name: string;
  address: string;
  plan: "basico" | "pro" | "proplus";
  active: boolean;
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

export interface SuperAdminSummary {
  totalGyms: number;
  activeGyms: number;
  inactiveGyms: number;
  totalClients: number;
  totalRevenue: number;
  planDistribution: {
    basico: number;
    pro: number;
    proplus: number;
  };
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
    createdAt: string;
  };
  admin: GymDetailAdmin | null;
  membership: GymDetailMembership | null;
  clientsCount: number;
  activeClientsCount: number;
  totalRevenue: number;
}
