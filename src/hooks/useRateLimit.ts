import { useRef, useCallback, useMemo } from 'react';

interface RateLimitConfig {
  maxCalls: number;
  timeWindow: number; // in milliseconds
  cooldownPeriod?: number; // in milliseconds
}

interface RateLimitState {
  calls: number;
  lastCallTime: number;
  isBlocked: boolean;
  blockUntil: number;
}

export function useRateLimit(config: RateLimitConfig) {
  const stateRef = useRef<RateLimitState>({
    calls: 0,
    lastCallTime: 0,
    isBlocked: false,
    blockUntil: 0
  });

  const canMakeCall = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Check if we're in a cooldown period
    if (state.isBlocked && now < state.blockUntil) {
      return false;
    }

    // Reset block state if cooldown is over
    if (state.isBlocked && now >= state.blockUntil) {
      state.isBlocked = false;
      state.calls = 0;
    }

    // Check if we're within the time window
    if (now - state.lastCallTime > config.timeWindow) {
      // Reset counter if outside time window
      state.calls = 0;
    }

    // Check if we've exceeded the maximum calls
    if (state.calls >= config.maxCalls) {
      // Start cooldown period
      state.isBlocked = true;
      state.blockUntil = now + (config.cooldownPeriod || config.timeWindow);
      return false;
    }

    return true;
  }, [config]);

  const makeCall = useCallback((): boolean => {
    if (!canMakeCall()) {
      return false;
    }

    const now = Date.now();
    const state = stateRef.current;

    state.calls++;
    state.lastCallTime = now;

    return true;
  }, [canMakeCall]);

  const getStatus = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;
    
    if (state.isBlocked && now < state.blockUntil) {
      const remainingTime = Math.ceil((state.blockUntil - now) / 1000);
      return {
        canCall: false,
        remainingCalls: 0,
        timeUntilReset: remainingTime,
        isBlocked: true
      };
    }

    const callsInWindow = now - state.lastCallTime < config.timeWindow ? state.calls : 0;
    const remainingCalls = Math.max(0, config.maxCalls - callsInWindow);

    return {
      canCall: remainingCalls > 0,
      remainingCalls,
      timeUntilReset: 0,
      isBlocked: false
    };
  }, [config]);

  const reset = useCallback(() => {
    stateRef.current = {
      calls: 0,
      lastCallTime: 0,
      isBlocked: false,
      blockUntil: 0
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