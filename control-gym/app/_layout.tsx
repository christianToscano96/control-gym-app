import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "../global.css";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserStore } from "../stores/store";
import { ThemeProvider as CustomThemeProvider } from "../context/ThemeContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== "/login" && pathname !== "/login/register") {
      router.replace("/login");
    } else if (
      user &&
      (pathname === "/login" || pathname === "/login/register")
    ) {
      router.replace("/(tabs)");
    }
  }, [user, pathname]);

  return (
    <CustomThemeProvider primaryColor="#78e08f">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="login/register"
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
            name="NewUserScreen"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
