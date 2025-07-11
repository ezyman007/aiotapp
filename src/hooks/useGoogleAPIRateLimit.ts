import { useRef, useCallback, useEffect, useMemo } from 'react';

interface GoogleAPIRateLimitConfig {
  maxCallsPerMinute: number;
  maxCallsPerHour: number;
  maxCallsPerDay: number;
}

interface RateLimitEntry {
  timestamp: number;
  endpoint: string;
}

interface RateLimitState {
  calls: RateLimitEntry[];
  isBlocked: boolean;
  blockUntil: number;
  blockReason: string;
}

const DEFAULT_CONFIG: GoogleAPIRateLimitConfig = {
  maxCallsPerMinute: 10,
  maxCallsPerHour: 100,
  maxCallsPerDay: 1000
};

// Singleton state to prevent multiple instances
let globalState: RateLimitState = {
  calls: [],
  isBlocked: false,
  blockUntil: 0,
  blockReason: ''
};

let cleanupInterval: NodeJS.Timeout | null = null;

// Initialize cleanup interval once
if (!cleanupInterval) {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    
    // Remove entries older than 24 hours
    globalState.calls = globalState.calls.filter(entry => now - entry.timestamp < 24 * 60 * 60 * 1000);
    
    // Check if we should unblock
    if (globalState.isBlocked && now >= globalState.blockUntil) {
      globalState.isBlocked = false;
      globalState.blockUntil = 0;
      globalState.blockReason = '';
    }
  }, 60000); // Clean up every minute
}

export function useGoogleAPIRateLimit(config: Partial<GoogleAPIRateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const getCallCounts = useCallback(() => {
    const now = Date.now();
    
    const callsPerMinute = globalState.calls.filter(entry => now - entry.timestamp < 60 * 1000).length;
    const callsPerHour = globalState.calls.filter(entry => now - entry.timestamp < 60 * 60 * 1000).length;
    const callsPerDay = globalState.calls.filter(entry => now - entry.timestamp < 24 * 60 * 60 * 1000).length;

    return { callsPerMinute, callsPerHour, callsPerDay };
  }, []);

  const canMakeCall = useCallback((endpoint: string = 'maps'): boolean => {
    const now = Date.now();

    // Check if we're blocked
    if (globalState.isBlocked && now < globalState.blockUntil) {
      return false;
    }

    // Unblock if time has passed
    if (globalState.isBlocked && now >= globalState.blockUntil) {
      globalState.isBlocked = false;
      globalState.blockUntil = 0;
      globalState.blockReason = '';
    }

    const { callsPerMinute, callsPerHour, callsPerDay } = getCallCounts();

    // Check limits
    if (callsPerMinute >= finalConfig.maxCallsPerMinute) {
      globalState.isBlocked = true;
      globalState.blockUntil = now + 60000; // Block for 1 minute
      globalState.blockReason = 'Minute limit exceeded';
      return false;
    }

    if (callsPerHour >= finalConfig.maxCallsPerHour) {
      globalState.isBlocked = true;
      globalState.blockUntil = now + 60 * 60 * 1000; // Block for 1 hour
      globalState.blockReason = 'Hour limit exceeded';
      return false;
    }

    if (callsPerDay >= finalConfig.maxCallsPerDay) {
      globalState.isBlocked = true;
      globalState.blockUntil = now + 24 * 60 * 60 * 1000; // Block for 24 hours
      globalState.blockReason = 'Daily limit exceeded';
      return false;
    }

    return true;
  }, [finalConfig, getCallCounts]);

  const makeCall = useCallback((endpoint: string = 'maps'): boolean => {
    if (!canMakeCall(endpoint)) {
      return false;
    }

    const now = Date.now();

    // Record the call
    globalState.calls.push({
      timestamp: now,
      endpoint
    });

    return true;
  }, [canMakeCall]);

  const getStatus = useCallback(() => {
    const now = Date.now();
    const { callsPerMinute, callsPerHour, callsPerDay } = getCallCounts();

    if (globalState.isBlocked && now < globalState.blockUntil) {
      return {
        canCall: false,
        remainingCalls: 0,
        timeUntilReset: Math.ceil((globalState.blockUntil - now) / 1000),
        isBlocked: true,
        blockReason: globalState.blockReason,
        callsPerMinute,
        callsPerHour,
        callsPerDay
      };
    }

    const remainingCalls = Math.max(0, finalConfig.maxCallsPerMinute - callsPerMinute);

    return {
      canCall: remainingCalls > 0 && !globalState.isBlocked,
      remainingCalls,
      timeUntilReset: 0,
      isBlocked: false,
      blockReason: '',
      callsPerMinute,
      callsPerHour,
      callsPerDay
    };
  }, [finalConfig, getCallCounts]);

  const reset = useCallback(() => {
    globalState = {
      calls: [],
      isBlocked: false,
      blockUntil: 0,
      blockReason: ''
    };
  }, []);

  // Memoize the returned object to prevent infinite re-renders
  return useMemo(() => ({
    canMakeCall,
    makeCall,
    getStatus,
    reset
  }), [canMakeCall, makeCall, getStatus, reset]);
} 