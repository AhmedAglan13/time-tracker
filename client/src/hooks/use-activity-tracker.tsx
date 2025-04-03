import { useState, useEffect, useCallback, useRef } from "react";

const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useActivityTracker() {
  const [isActive, setIsActive] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const [activityLogs, setActivityLogs] = useState<{ timestamp: Date; message: string }[]>([]);
  
  // Create refs to track state for timer callbacks
  const isActiveRef = useRef(false);
  const isIdleRef = useRef(false);
  
  const timerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const idleTimeoutRef = useRef<number | null>(null);
  
  // Keep refs in sync with state
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  
  useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);
  
  // Log activity function
  const logActivity = useCallback((message: string) => {
    setActivityLogs(prev => [
      ...prev, 
      { timestamp: new Date(), message }
    ]);
  }, []);
  
  // Reset idle timer when keyboard activity is detected
  const resetIdleTimer = useCallback(() => {
    if (!isActiveRef.current) return;
    
    const now = Date.now();
    lastActivityRef.current = now;
    
    // If we were idle, resume activity
    if (isIdleRef.current) {
      setIsIdle(false);
      logActivity('Activity resumed');
    }
    
    // Clear any existing timeout
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    
    // Set a new timeout
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsIdle(true);
      logActivity('Idle state detected - timer paused');
      setIdleTime(0);
    }, IDLE_THRESHOLD);
  }, [logActivity]);
  
  // Update timer every second - Using refs to avoid dependency cycle
  const updateTimer = useCallback(() => {
    // Use refs to check the current state
    if (isActiveRef.current && !isIdleRef.current) {
      setActiveSeconds(prev => prev + 1);
    }
    
    if (isIdleRef.current) {
      setIdleTime(prev => prev + 1);
    }
  }, []);
  
  // Start tracking
  const startTracking = useCallback(() => {
    setIsActive(true);
    setActiveSeconds(0);
    setIsIdle(false);
    setIdleTime(0);
    setActivityLogs([
      { timestamp: new Date(), message: 'Session tracking initialized' }
    ]);
    
    // Start the timer
    timerRef.current = window.setInterval(updateTimer, 1000);
    
    // Setup keyboard event listeners
    window.addEventListener('keydown', resetIdleTimer);
    
    // Initial idle timer
    resetIdleTimer();
    
    logActivity('Tracking started');
  }, [updateTimer, resetIdleTimer, logActivity]);
  
  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsActive(false);
    
    // Clear timers
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
    
    // Remove event listeners
    window.removeEventListener('keydown', resetIdleTimer);
    
    logActivity('Tracking stopped');
  }, [resetIdleTimer, logActivity]);
  
  // Clean up effect
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
      
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [resetIdleTimer]);
  
  // Format time as HH:MM:SS
  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  // Format date as Month DD, YYYY
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Format duration in seconds to HH:MM:SS
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
  }, []);

  // Format duration in seconds to friendly format (5h 32m)
  const formatDurationFriendly = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  }, []);

  // Pad number with leading zero if needed
  const padZero = useCallback((num: number): string => {
    return num.toString().padStart(2, '0');
  }, []);
  
  return {
    isActive,
    isIdle,
    activeSeconds,
    idleTime,
    activityLogs,
    startTracking,
    stopTracking,
    resetIdleTimer,
    logActivity,
    formatTime,
    formatDate,
    formatDuration,
    formatDurationFriendly,
    padZero
  };
}
