// frontend/src/components/charts/VolumeChart.jsx
import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VolumeChart = ({ data = [], anomalies = [] }) => {
  const chartRef = useRef(null);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No volume data available</p>
      </div>
    );
  }

  const volumeData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Volume',
        data: data.map(d => (d.volume / 1000000).toFixed(2)), // Convert to millions
        backgroundColor: data.map(d => {
          const isAnomaly = anomalies?.some(a => a.date === d.date);
          return isAnomaly ? '#ef4444' : '#60a5fa';
        }),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Volume: ${context.parsed.y}M`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        title: {
          display: true,
          text: 'Volume (Millions)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar ref={chartRef} data={volumeData} options={options} />;
};

export default VolumeChart;