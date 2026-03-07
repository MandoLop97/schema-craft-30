import { createContext, useContext } from 'react';
import { ThemeTokens } from '@/types/schema';

const ThemeContext = createContext<ThemeTokens | null>(null);

export const ThemeProvider = ThemeContext.Provider;

export function useThemeTokens(): ThemeTokens | null {
  return useContext(ThemeContext);
}
