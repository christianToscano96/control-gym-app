import { create } from "zustand";

interface UserState {
  user: null | { id: string; name: string; role: "admin" | "superadmin" };
  setUser: (user: UserState["user"]) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

interface MembershipState {
  hasActiveMembership: boolean;
  setHasActiveMembership: (active: boolean) => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  hasActiveMembership: false,
  setHasActiveMembership: (active) => set({ hasActiveMembership: active }),
}));
