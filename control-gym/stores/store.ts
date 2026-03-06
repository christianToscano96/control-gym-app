import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

// SecureStore helpers (fallback to AsyncStorage on web)
async function saveToken(token: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function deleteToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

interface UserState {
  user: null | {
    id: string;
    name: string;
    role: "admin" | "superadmin" | "empleado";
    avatar?: string;
    gymId?: string;
    gymActive?: boolean;
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
          saveToken(token);
        }
        set({ user });
      },
      logout: async () => {
        await deleteToken();
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
