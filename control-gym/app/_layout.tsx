import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserStore } from "@/store";

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
      if (!user && pathname !== "/login" && pathname !== "/register") {
        router.replace("/login");
      }
      if (user && pathname === "/login") {
        router.replace("/(tabs)");
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [user, pathname]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "Registro" }} />
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
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
