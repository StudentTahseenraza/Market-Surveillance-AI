// src/components/dashboard/StatCard.jsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
// import Icon from '@mui/material/Icon';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  change,
  changeType,
  suffix = '' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}{suffix}
          </p>
          
          {change && (
            <div className="mt-2 flex items-center">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ml-1 ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change} from last month
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;