"use client";
import { useMemo } from 'react';

interface MagnetometerCompassProps {
  x: number | null;
  y: number | null;
  z: number | null;
}

export function MagnetometerCompass({ x, y, z }: MagnetometerCompassProps) {
  const { direction, angle, strength } = useMemo(() => {
    if (x === null || y === null || z === null) {
      return { direction: 'N/A', angle: 0, strength: 0 };
    }

    // Calculate compass angle from X and Y values
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    
    // Calculate magnetic field strength
    const strength = Math.sqrt(x * x + y * y + z * z);
    
    // Determine compass direction
    let direction = 'N';
    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) direction = 'N';
    else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) direction = 'NE';
    else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) direction = 'E';
    else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) direction = 'SE';
    else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) direction = 'S';
    else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) direction = 'SW';
    else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) direction = 'W';
    else if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) direction = 'NW';

    return { direction, angle: normalizedAngle, strength };
  }, [x, y, z]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg border border-white/20">
      {/* Compass Rose */}
      <div className="relative w-36 h-36 mb-3">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-blue-400/60 rounded-full bg-gradient-to-br from-blue-900/30 to-indigo-900/30 shadow-lg backdrop-blur-sm">
          {/* Inner Ring */}
          <div className="absolute inset-2 border-2 border-blue-300/50 rounded-full bg-white/10 backdrop-blur-sm"></div>
          
          {/* Direction Labels */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-sm font-bold text-white drop-shadow-lg">N</div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm font-bold text-white drop-shadow-lg">S</div>
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white drop-shadow-lg">W</div>
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white drop-shadow-lg">E</div>
          
          {/* Diagonal Directions */}
          <div className="absolute top-2 right-2 text-xs font-semibold text-white/90 drop-shadow-md">NE</div>
          <div className="absolute bottom-2 right-2 text-xs font-semibold text-white/90 drop-shadow-md">SE</div>
          <div className="absolute bottom-2 left-2 text-xs font-semibold text-white/90 drop-shadow-md">SW</div>
          <div className="absolute top-2 left-2 text-xs font-semibold text-white/90 drop-shadow-md">NW</div>
          
          {/* Magnetic Needle */}
          {x !== null && y !== null && (
            <div 
              className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-red-500 to-red-600 transform -translate-x-1/2 -translate-y-1/2 origin-bottom shadow-md"
              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
            >
              <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full shadow-lg border-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gray-700 rounded-full shadow-md"></div>
            </div>
          )}
          
          {/* Center Point */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md"></div>
        </div>
      </div>

      {/* Current Direction */}
      <div className="text-center mb-3">
        <div className="text-xl font-bold text-white bg-blue-600/80 px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
          {direction}
        </div>
        <div className="text-xs text-white/90 mt-1 font-medium">{angle.toFixed(1)}°</div>
      </div>

      {/* X, Y, Z Values with Arrows */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/30">
          <div className="text-xs text-white/90 mb-1 font-semibold">X</div>
          <div className="flex items-center justify-center">
            <div className="text-sm font-mono text-white font-bold">{x !== null ? x.toFixed(1) : 'N/A'}</div>
            {x !== null && (
              <div className={`ml-1 text-sm font-bold ${x > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {x > 0 ? '→' : '←'}
              </div>
            )}
          </div>
        </div>
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/30">
          <div className="text-xs text-white/90 mb-1 font-semibold">Y</div>
          <div className="flex items-center justify-center">
            <div className="text-sm font-mono text-white font-bold">{y !== null ? y.toFixed(1) : 'N/A'}</div>
            {y !== null && (
              <div className={`ml-1 text-sm font-bold ${y > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {y > 0 ? '↑' : '↓'}
              </div>
            )}
          </div>
        </div>
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/30">
          <div className="text-xs text-white/90 mb-1 font-semibold">Z</div>
          <div className="flex items-center justify-center">
            <div className="text-sm font-mono text-white font-bold">{z !== null ? z.toFixed(1) : 'N/A'}</div>
            {z !== null && (
              <div className={`ml-1 text-sm font-bold ${z > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {z > 0 ? '⊙' : '⊗'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="mt-3 text-center bg-white/20 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/30">
        <div className="text-xs text-white/90 font-semibold">Magnetic Strength</div>
        <div className="text-sm font-mono text-blue-300 font-bold">{strength.toFixed(1)} μT</div>
      </div>
    </div>
  );
} 