// frontend/src/components/dashboard/RiskDistribution.jsx
import React, { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ArcElement
ChartJS.register(ArcElement, Tooltip, Legend);

const RiskDistribution = ({ anomalies = [] }) => {
  const chartRef = useRef(null);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No risk data available</p>
      </div>
    );
  }

  const highRisk = anomalies.filter(a => a.risk_level === 'High').length;
  const mediumRisk = anomalies.filter(a => a.risk_level === 'Medium').length;
  const lowRisk = anomalies.filter(a => a.risk_level === 'Low').length;

  const data = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [highRisk, mediumRisk, lowRisk],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: '#374151',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Doughnut ref={chartRef} data={data} options={options} />;
};

export default RiskDistribution;