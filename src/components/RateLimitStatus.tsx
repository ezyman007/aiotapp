"use client";
import { useGoogleAPIRateLimit } from '@/hooks/useGoogleAPIRateLimit';
import { useRef, useEffect, useState } from 'react';

interface RateLimitStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function RateLimitStatus({ className = "", showDetails = false }: RateLimitStatusProps) {
  const rateLimit = useGoogleAPIRateLimit();
  const [status, setStatus] = useState(() => rateLimit.getStatus());
  const rateLimitRef = useRef(rateLimit);

  // Update status periodically without causing re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const newStatus = rateLimit.getStatus();
        setStatus(newStatus);
      } catch (error) {
        console.error('Error getting rate limit status:', error);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent infinite re-renders

  // Update ref when rateLimit changes - but don't cause re-renders
  useEffect(() => {
    rateLimitRef.current = rateLimit;
  }, []); // Empty dependency array to prevent infinite re-renders

  // Early return if no status needed
  if (!showDetails && status.remainingCalls > 2 && !status.isBlocked) {
    return null;
  }

  return (
    <div className={`text-xs ${className}`}>
      {status.isBlocked ? (
        <div className="flex items-center gap-2 text-orange-600 bg-orange-100 px-2 py-1 rounded">
          <span className="font-medium">API Rate Limited</span>
          <span>{status.blockReason}</span>
          <span>({status.timeUntilReset}s)</span>
        </div>
      ) : status.remainingCalls <= 2 ? (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
          <span className="font-medium">API Usage</span>
          <span>{status.remainingCalls} calls remaining</span>
        </div>
      ) : showDetails ? (
        <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-2 py-1 rounded">
          <span className="font-medium">API Status</span>
          <span>{status.remainingCalls} calls left</span>
          <span>•</span>
          <span>{status.callsPerMinute}/min</span>
          <span>•</span>
          <span>{status.callsPerHour}/hour</span>
          <span>•</span>
          <span>{status.callsPerDay}/day</span>
        </div>
      ) : null}
    </div>
  );
} 