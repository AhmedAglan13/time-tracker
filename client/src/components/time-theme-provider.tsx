import { createContext, useContext, ReactNode } from 'react';
import { useTimeBasedTheme } from '@/hooks/use-time-based-theme';

// Create the context
type TimeThemeContextType = ReturnType<typeof useTimeBasedTheme>;
const TimeThemeContext = createContext<TimeThemeContextType | null>(null);

// Provider component
export function TimeThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTimeBasedTheme();
  
  return (
    <TimeThemeContext.Provider value={theme}>
      {children}
    </TimeThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTimeTheme() {
  const context = useContext(TimeThemeContext);
  if (context === null) {
    throw new Error('useTimeTheme must be used within a TimeThemeProvider');
  }
  return context;
}