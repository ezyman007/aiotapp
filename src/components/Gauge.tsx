"use client";

interface GaugeProps {
  value: number | null;
  min: number;
  max: number;
  label: string;
  unit?: string;
}

export function Gauge({ value, min, max, label, unit }: GaugeProps) {
  const radius = 40;
  const stroke = 8;
  const center = 50;
  const angle = 180;
  const startAngle = 180;
  const endAngle = 0;
  const range = max - min;
  const safeValue = value === null || isNaN(value) ? min : Math.max(min, Math.min(max, value));
  const percent = (safeValue - min) / range;
  const theta = startAngle - percent * angle;
  const rad = (theta * Math.PI) / 180;
  const needleX = center + radius * Math.cos(rad);
  const needleY = center + radius * Math.sin(rad);

  // Arc path for gauge background
  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = end - start <= 180 ? 0 : 1;
    return `M${x1},${y1} A${r},${r} 0 ${largeArc} 0 ${x2},${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={60} viewBox="0 0 100 60">
        {/* Background arc */}
        <path
          d={describeArc(center, center, radius, startAngle, endAngle)}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Value arc */}
        <path
          d={describeArc(center, center, radius, startAngle, theta)}
          stroke="#3b82f6"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={needleX}
          y2={needleY}
          stroke="#ef4444"
          strokeWidth={3}
        />
        {/* Center dot */}
        <circle cx={center} cy={center} r={4} fill="#3b82f6" />
      </svg>
      <div className="text-xs text-gray-700 font-semibold mt-1">{label}</div>
      <div className="text-sm font-mono text-gray-900">
        {value !== null && !isNaN(value) ? value.toFixed(1) : 'N/A'} {unit}
      </div>
    </div>
  );
} 