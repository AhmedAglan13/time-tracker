import { createContext, useContext, ReactNode, useState } from 'react';

// Define help content for each section of the application
export interface HelpContent {
  title: string;
  content: React.ReactNode;
}

// Creating a map of help content with unique identifiers
export type HelpContentMap = Record<string, HelpContent>;

// Define our help content for different parts of the app
const defaultHelpContent: HelpContentMap = {
  // Dashboard help content
  'dashboard-overview': {
    title: 'Dashboard Overview',
    content: (
      <>
        <p>Welcome to your dashboard! Here you can see an overview of your work activity and access all features of the application.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>View your current session status</li>
          <li>Check weekly and daily statistics</li>
          <li>Access all the main features from the quick access cards</li>
        </ul>
      </>
    )
  },
  'current-session': {
    title: 'Current Session',
    content: (
      <>
        <p>This shows your current active work session.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Time is only counted when you're actively using the keyboard</li>
          <li>After 5 minutes of inactivity, time counting pauses</li>
          <li>Click "Start Tracking" to begin a new session</li>
        </ul>
      </>
    )
  },
  // Tracker help content
  'tracker-usage': {
    title: 'Using the Time Tracker',
    content: (
      <>
        <p>The time tracker monitors your active working time.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Press "Start" to begin tracking your work session</li>
          <li>The timer automatically pauses after 5 minutes of inactivity</li>
          <li>Press "Stop" to end your current work session</li>
          <li>All session data is stored for future reference</li>
        </ul>
      </>
    )
  },
  // History help content
  'history-filters': {
    title: 'Using History Filters',
    content: (
      <>
        <p>Filter your session history to find specific work periods.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Choose time periods from the dropdown menu</li>
          <li>Sort by different criteria</li>
          <li>Use the search box to find sessions by description</li>
          <li>Click on any session to view detailed information</li>
        </ul>
      </>
    )
  },
  'export-data': {
    title: 'Exporting Your Data',
    content: (
      <>
        <p>Export your session data for use in other applications.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Choose between CSV and JSON formats</li>
          <li>Export filtered data or all sessions</li>
          <li>Downloaded files include all session details</li>
        </ul>
      </>
    )
  },
  // Admin help content
  'admin-overview': {
    title: 'Admin Dashboard Overview',
    content: (
      <>
        <p>As an administrator, you have access to organization-wide data.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>View statistics for all users</li>
          <li>Monitor active users in real-time</li>
          <li>Access reports and analytics</li>
          <li>Export organization-wide data</li>
        </ul>
      </>
    )
  },
  'analytics-usage': {
    title: 'Understanding Analytics',
    content: (
      <>
        <p>Analytics provide insights into your organization's working patterns.</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>View trends over time</li>
          <li>Compare time periods</li>
          <li>See breakdowns by user</li>
          <li>Identify productivity patterns</li>
        </ul>
      </>
    )
  },
};

// Context definition
type HelpContextType = {
  helpContent: HelpContentMap;
  updateHelpContent: (id: string, content: HelpContent) => void;
  getHelpContent: (id: string) => HelpContent | undefined;
};

const HelpContext = createContext<HelpContextType | null>(null);

// Provider component
export function HelpProvider({ children }: { children: ReactNode }) {
  const [helpContent, setHelpContent] = useState<HelpContentMap>(defaultHelpContent);

  const updateHelpContent = (id: string, content: HelpContent) => {
    setHelpContent(prevContent => ({
      ...prevContent,
      [id]: content
    }));
  };

  const getHelpContent = (id: string) => {
    return helpContent[id];
  };

  return (
    <HelpContext.Provider value={{ helpContent, updateHelpContent, getHelpContent }}>
      {children}
    </HelpContext.Provider>
  );
}

// Hook for using help content
export function useHelpContent() {
  const context = useContext(HelpContext);
  
  if (!context) {
    throw new Error('useHelpContent must be used within a HelpProvider');
  }
  
  return context;
}