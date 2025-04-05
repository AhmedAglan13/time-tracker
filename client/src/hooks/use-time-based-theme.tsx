import { useState, useEffect } from 'react';

// Define time periods and their corresponding color schemes
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  icon: string;
}

// Color schemes for different times of day
export const colorSchemes: Record<TimePeriod, ColorScheme> = {
  morning: {
    primary: 'hsla(271, 81%, 56%, 1)', // Vibrant purple (default)
    secondary: 'hsla(43, 96%, 58%, 1)', // Warm yellow
    accent: 'hsla(193, 82%, 51%, 1)',   // Fresh blue
    background: 'from-blue-50 to-purple-50',
    gradient: 'from-amber-200/10 to-amber-400/30',
    icon: '☀️'
  },
  afternoon: {
    primary: 'hsla(271, 81%, 56%, 1)',  // Vibrant purple (default)
    secondary: 'hsla(25, 95%, 53%, 1)', // Bright orange
    accent: 'hsla(152, 69%, 31%, 1)',   // Deep green
    background: 'from-sky-50 to-indigo-50',
    gradient: 'from-orange-200/10 to-orange-400/30',
    icon: '🌤️'
  },
  evening: {
    primary: 'hsla(271, 91%, 46%, 1)',  // Deeper purple
    secondary: 'hsla(339, 90%, 51%, 1)', // Warm pink
    accent: 'hsla(211, 92%, 52%, 1)',    // Deep blue
    background: 'from-indigo-50 to-pink-50',
    gradient: 'from-pink-200/10 to-purple-400/30',
    icon: '🌆'
  },
  night: {
    primary: 'hsla(271, 76%, 53%, 1)',   // Softer purple
    secondary: 'hsla(217, 91%, 60%, 1)', // Midnight blue
    accent: 'hsla(170, 76%, 36%, 1)',    // Teal
    background: 'from-slate-900 to-purple-900',
    gradient: 'from-blue-900/30 to-purple-800/50',
    icon: '🌙'
  }
};

// Storage key for test mode
const TEST_MODE_KEY = 'time_tracker_test_mode';
const TEST_PERIOD_KEY = 'time_tracker_test_period';

// Function to determine current time period
function getCurrentTimePeriod(): TimePeriod {
  // Check if test mode is enabled
  const testMode = localStorage.getItem(TEST_MODE_KEY) === 'true';
  if (testMode) {
    const testPeriod = localStorage.getItem(TEST_PERIOD_KEY) as TimePeriod | null;
    if (testPeriod && Object.keys(colorSchemes).includes(testPeriod)) {
      return testPeriod as TimePeriod;
    }
  }
  
  // Real time-based logic
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

export function useTimeBasedTheme() {
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>(getCurrentTimePeriod());
  const [scheme, setScheme] = useState<ColorScheme>(colorSchemes[currentPeriod]);
  const [testMode, setTestMode] = useState<boolean>(localStorage.getItem(TEST_MODE_KEY) === 'true');
  
  // Update time period and scheme when not in test mode
  useEffect(() => {
    if (testMode) return; // Don't run interval in test mode
    
    const interval = setInterval(() => {
      const newPeriod = getCurrentTimePeriod();
      if (newPeriod !== currentPeriod) {
        setCurrentPeriod(newPeriod);
        setScheme(colorSchemes[newPeriod]);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentPeriod, testMode]);
  
  // Function to manually set the time period (for testing)
  const setTimePeriod = (period: TimePeriod) => {
    setCurrentPeriod(period);
    setScheme(colorSchemes[period]);
    localStorage.setItem(TEST_PERIOD_KEY, period);
  };
  
  // Toggle test mode
  const toggleTestMode = () => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);
    localStorage.setItem(TEST_MODE_KEY, newTestMode.toString());
    
    if (!newTestMode) {
      // Revert to real time if leaving test mode
      const realPeriod = getCurrentTimePeriod();
      setCurrentPeriod(realPeriod);
      setScheme(colorSchemes[realPeriod]);
    }
  };
  
  // Return current time period, theme data and helper functions
  return {
    timePeriod: currentPeriod,
    colorScheme: scheme,
    colorSchemes,
    testMode,
    toggleTestMode,
    setTimePeriod,
    getGreeting: () => {
      switch(currentPeriod) {
        case 'morning': return 'Good morning';
        case 'afternoon': return 'Good afternoon';
        case 'evening': return 'Good evening';
        case 'night': return 'Good night';
      }
    },
    getPeriodIcon: () => scheme.icon
  };
}