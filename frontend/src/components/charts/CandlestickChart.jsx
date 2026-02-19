// frontend/src/components/charts/CandlestickChart.jsx
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const CandlestickChart = ({ data = [], anomalies = [] }) => {
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
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Prepare data
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Close Price',
        data: data.map(d => d.close),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        pointBackgroundColor: data.map(d => {
          const isAnomaly = anomalies?.some(a => a.date === d.date);
          return isAnomaly ? '#ef4444' : '#2563eb';
        }),
        pointBorderColor: data.map(d => {
          const isAnomaly = anomalies?.some(a => a.date === d.date);
          return isAnomaly ? '#ef4444' : '#2563eb';
        }),
        pointRadius: data.map(d => {
          const isAnomaly = anomalies?.some(a => a.date === d.date);
          return isAnomaly ? 6 : 3;
        }),
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
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
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} />;
};

export default CandlestickChart;