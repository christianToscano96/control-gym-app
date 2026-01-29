import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  user: null | {
    id: string;
    name: string;
    role: "admin" | "superadmin";
    avatar?: string;
    token?: string;
  };
  setUser: (user: UserState["user"], token?: string) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: UserState["user"], token?: string) => {
        if (user && token) {
          set({ user: { ...user, token } });
        } else {
          set({ user });
        }
      },
      logout: async () => {
        await AsyncStorage.removeItem("user-storage");
        set({ user: null });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: UserState) => ({ user: state.user }),
    },
  ),
);

interface MembershipState {
  hasActiveMembership: boolean;
  setHasActiveMembership: (active: boolean) => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  hasActiveMembership: false,
  setHasActiveMembership: (active) => set({ hasActiveMembership: active }),
}));
