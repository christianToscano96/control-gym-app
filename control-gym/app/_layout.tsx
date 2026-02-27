import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider as CustomThemeProvider } from "../context/ThemeContext";
import "../global.css";
import { queryClient } from "../lib/queryClient";
import { useUserStore } from "../stores/store";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Evitar navegación prematura: usar setTimeout para esperar montaje
    const timeout = setTimeout(() => {
      if (!user && pathname !== "/login" && pathname !== "/login/register" && pathname !== "/login/forgot-password") {
        router.replace("/login");
      }
      if (user && pathname === "/login") {
        router.replace("/(tabs)");
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [user, pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider primaryColor="#78e08f">
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
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
              name="screens/config/PeriodPricingScreen"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}
