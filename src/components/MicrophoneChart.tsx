"use client";
import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MicrophoneChartProps {
  freqData: number[];
  volume: number;
}

export function MicrophoneChart({ freqData, volume }: MicrophoneChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: "Frequency Spectrum",
        data: [],
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  });

  useEffect(() => {
    // Use first 32 frequency bins for better visualization
    const displayData = freqData.slice(0, 32);
    const labels = displayData.map((_, index) => `${index * 2}Hz`);
    setChartData({
      labels,
      datasets: [
        {
          label: "Frequency Spectrum",
          data: displayData,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
        },
      ],
    });
  }, [freqData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Microphone - Volume: ${volume.toFixed(1)}`,
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
          text: "Frequency (Hz)",
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
        beginAtZero: true,
        max: 255,
        title: {
          display: true,
          text: "Amplitude",
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

  return <Bar options={options} data={chartData} />;
} 