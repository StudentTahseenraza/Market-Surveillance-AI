// frontend/src/components/charts/RiskGauge.jsx
import React, { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ArcElement specifically for doughnut/pie charts
ChartJS.register(ArcElement, Tooltip, Legend);

const RiskGauge = ({ value, max = 100, thresholds = { low: 30, medium: 70 } }) => {
  const chartRef = useRef(null);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const percentage = (value / max) * 100;
  
  // Get color based on risk level
  const getColor = () => {
    if (percentage > thresholds.medium) return '#ef4444';
    if (percentage > thresholds.low) return '#f59e0b';
    return '#10b981';
  };

  const data = {
    labels: ['Risk', 'Remaining'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [getColor(), '#e5e7eb'],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="relative h-full">
      <Doughnut ref={chartRef} data={data} options={options} />
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500 ml-1">/100</span>
      </div>
      <div className="absolute inset-x-0 bottom-8 text-center">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          percentage > thresholds.medium ? 'bg-red-100 text-red-800' :
          percentage > thresholds.low ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {percentage > thresholds.medium ? 'High Risk' :
           percentage > thresholds.low ? 'Medium Risk' : 'Low Risk'}
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;