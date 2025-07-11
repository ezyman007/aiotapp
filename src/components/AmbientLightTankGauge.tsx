"use client";
import { useMemo } from "react";

interface AmbientLightTankGaugeProps {
  lux: number | null;
}

export function AmbientLightTankGauge({ lux }: AmbientLightTankGaugeProps) {
  const { fillPercentage, color, level } = useMemo(() => {
    if (lux === null) {
      return { fillPercentage: 0, color: '#6b7280', level: 'N/A' };
    }

    // Define light levels and their colors
    const levels = [
      { max: 50, color: '#1e40af', level: 'Very Low' },
      { max: 200, color: '#3b82f6', level: 'Low' },
      { max: 500, color: '#10b981', level: 'Medium' },
      { max: 1000, color: '#f59e0b', level: 'Bright' },
      { max: 5000, color: '#ef4444', level: 'Very Bright' },
      { max: Infinity, color: '#dc2626', level: 'Extreme' }
    ];

    const currentLevel = levels.find(level => lux <= level.max) || levels[levels.length - 1];
    const maxLux = 5000; // Max value for percentage calculation
    const fillPercentage = Math.min((lux / maxLux) * 100, 100);

    return {
      fillPercentage,
      color: currentLevel.color,
      level: currentLevel.level
    };
  }, [lux]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      <div className="relative w-full h-full max-w-[200px] max-h-[120px]">
        {/* Tank outline */}
        <div className="absolute inset-0 border-4 border-white/40 rounded-lg bg-white/10 backdrop-blur-sm">
          {/* Fill level */}
          <div 
            className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-500 ease-out"
            style={{
              height: `${fillPercentage}%`,
              backgroundColor: color,
              boxShadow: `inset 0 0 10px ${color}40`
            }}
          />
          
          {/* Light rays effect */}
          {lux !== null && lux > 200 && (
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 bg-yellow-300 opacity-80 animate-pulse"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '0%',
                    height: '100%',
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold drop-shadow-lg">
          <div className="text-lg font-mono bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
            {lux !== null ? `${lux.toFixed(0)}` : 'N/A'}
          </div>
          <div className="text-xs opacity-90 bg-black/20 px-2 py-1 rounded backdrop-blur-sm mt-1">
            {level}
          </div>
        </div>
        
        {/* Scale markers */}
        <div className="absolute left-1 top-1 bottom-1 flex flex-col justify-between text-xs text-white font-bold drop-shadow-md">
          <span>5000</span>
          <span>2500</span>
          <span>1000</span>
          <span>500</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
} 