"use client";
import { useEffect, useState } from "react";

interface ModernGaugeProps {
  value: number | null;
  min: number;
  max: number;
  label: string;
  unit?: string;
  color?: string;
}

export function ModernGauge({ value, min, max, label, unit, color = "#3b82f6" }: ModernGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const targetValue = value === null || isNaN(value) ? min : Math.max(min, Math.min(max, value));
    const timer = setTimeout(() => setAnimatedValue(targetValue), 100);
    return () => clearTimeout(timer);
  }, [value, min, max]);

  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const safeValue = value === null || isNaN(value) ? min : Math.max(min, Math.min(max, value));
  const percentage = ((safeValue - min) / (max - min)) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percent: number) => {
    if (percent < 30) return "#10b981"; // green
    if (percent < 70) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className="flex flex-col items-center p-2">
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={getColor(percentage)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-white drop-shadow-lg">
            {value !== null && !isNaN(value) ? value.toFixed(1) : 'N/A'}
          </div>
          <div className="text-xs text-white/90 font-medium">{unit}</div>
          <div className="text-xs font-bold text-white/80">{percentage.toFixed(0)}%</div>
        </div>
      </div>
      <div className="text-sm font-bold text-white mt-2 text-center drop-shadow-sm">{label}</div>
    </div>
  );
} 