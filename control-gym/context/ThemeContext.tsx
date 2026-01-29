import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeContextProps {
  primaryColor: string;
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  toggleTheme: () => void;
  themeMode: "auto" | "dark" | "light";
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  primaryColor?: string;
}

const THEME_STORAGE_KEY = "@gym_app_theme_mode";

export const ThemeProvider = ({
  children,
  primaryColor = "#007AFF",
}: ThemeProviderProps) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<"auto" | "dark" | "light">("auto");

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme &&
          (savedTheme === "dark" ||
            savedTheme === "light" ||
            savedTheme === "auto")
        ) {
          setThemeMode(savedTheme as "auto" | "dark" | "light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  // Determine actual dark mode state
  const isDark =
    themeMode === "auto" ? systemColorScheme === "dark" : themeMode === "dark";

  const toggleTheme = async () => {
    const newMode = isDark ? "light" : "dark";
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = {
    background: isDark ? "#0a0f1d" : "#FFFFFF",
    card: isDark ? "#1a1f2e" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1F2937",
    textSecondary: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#2d3548" : "#E5E7EB",
    error: "#DC2626",
    success: "#10B981",
    warning: "#D97706",
  };

  return (
    <ThemeContext.Provider
      value={{ primaryColor, isDark, colors, toggleTheme, themeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
