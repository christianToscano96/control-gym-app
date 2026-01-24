import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextProps {
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  primaryColor?: string;
}

export const ThemeProvider = ({ children, primaryColor = '#007AFF' }: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider value={{ primaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
