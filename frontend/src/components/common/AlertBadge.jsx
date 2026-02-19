// frontend/src/components/common/AlertBadge.jsx
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const AlertBadge = ({ count, onClick, className = '' }) => {
  if (!count || count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center p-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 ${className}`}
    >
      <ExclamationTriangleIcon className="w-5 h-5" />
      <span className="sr-only">Notifications</span>
      <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-800 border-2 border-white rounded-full -top-2 -right-2">
        {count > 99 ? '99+' : count}
      </div>
    </button>
  );
};

export default AlertBadge;