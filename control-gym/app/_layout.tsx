import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider as CustomThemeProvider } from "../context/ThemeContext";
import "../global.css";
import { queryClient } from "../lib/queryClient";
import { useUserStore } from "../stores/store";
import { useGymStatusQuery } from "../hooks/queries/useGymStatus";

export const unstable_settings = {
  anchor: "(tabs)",
};

function NavigationGuard() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  // Poll gym status only for admin users who are logged in
  const { data: gymStatus } = useGymStatusQuery(!!user && isAdmin);

  // Auth guard
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        !user &&
        pathname !== "/login" &&
        pathname !== "/login/register" &&
        pathname !== "/login/forgot-password" &&
        pathname !== "/gym-suspended"
      ) {
        router.replace("/login");
      }
      if (user && pathname === "/login") {
        router.replace("/(tabs)");
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [user, pathname]);

  // Gym active status guard (reactive)
  useEffect(() => {
    if (!user || !isAdmin || gymStatus === undefined) return;

    if (!gymStatus.active && pathname !== "/gym-suspended") {
      router.replace("/gym-suspended");
    }
    if (gymStatus.active && pathname === "/gym-suspended") {
      // Invalidate all queries so dashboard loads fresh data after reactivation
      qc.invalidateQueries();
      router.replace("/(tabs)");
    }
  }, [gymStatus, user, isAdmin, pathname, router, qc]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider primaryColor="#78e08f">
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <NavigationGuard />
          <Stack>
            <Stack.Screen name="login/index" options={{ headerShown: false }} />
            <Stack.Screen
              name="login/register"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="login/forgot-password"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile"
              options={{ title: "Perfil", headerBackTitle: "Volver" }}
            />
            <Stack.Screen
              name="membership"
              options={{ title: "Membresía", headerBackTitle: "Volver" }}
            />
            <Stack.Screen
              name="screens/clients/NewClientScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/clients/client-details/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/profile/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/staff/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/config/EmailConfigScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/clients/RenewMembershipScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/config/PeriodPricingScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="screens/superadmin/gym-detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="gym-suspended"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}
