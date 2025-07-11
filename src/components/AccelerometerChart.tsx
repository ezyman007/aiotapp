"use client";
import { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  roll: number;
  pitch: number;
  yaw: number;
}

interface AccelerometerChartProps {
  data: AccelerometerData;
}

export function AccelerometerChart({ data }: AccelerometerChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: "X",
        data: [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Y",
        data: [],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "Z",
        data: [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  });

  const dataPointsRef = useRef<{ x: number; y: number; z: number; timestamp: number }[]>([]);

  useEffect(() => {
    const now = Date.now();
    const newDataPoint = { x: data.x, y: data.y, z: data.z, timestamp: now };
    dataPointsRef.current.push(newDataPoint);
    
    // Keep only the last 10 seconds of data (assuming 50ms intervals = 200 points)
    const tenSecondsAgo = now - 10000;
    dataPointsRef.current = dataPointsRef.current.filter(point => point.timestamp > tenSecondsAgo);

    // Create time labels (seconds ago)
    const labels = dataPointsRef.current.map(point => {
      const secondsAgo = ((now - point.timestamp) / 1000).toFixed(1);
      return `${secondsAgo}s`;
    });
    
    setChartData({
      labels,
      datasets: [
        {
          label: "X",
          data: dataPointsRef.current.map((d) => d.x),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Y",
          data: dataPointsRef.current.map((d) => d.y),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
        {
          label: "Z",
          data: dataPointsRef.current.map((d) => d.z),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    });
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Accelerometer Data (Last 10s)",
        color: '#ffffff',
        font: {
          size: 14,
          weight: 'bold' as const
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (seconds ago)",
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Acceleration (m/s²)",
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
    },
  };

  return <Line options={options} data={chartData} />;
} 