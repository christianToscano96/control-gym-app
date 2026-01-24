
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface UserState {
	user: null | { id: string; name: string; role: "admin" | "superadmin" };
	setUser: (user: UserState["user"]) => void;
	logout: () => void;
}

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			setUser: (user: UserState["user"]) => set({ user }),
			logout: () => set({ user: null }),
		}),
		{
			name: "user-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state: UserState) => ({ user: state.user }),
		}
	)
);

interface MembershipState {
	hasActiveMembership: boolean;
	setHasActiveMembership: (active: boolean) => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
	hasActiveMembership: false,
	setHasActiveMembership: (active) => set({ hasActiveMembership: active }),
}));
