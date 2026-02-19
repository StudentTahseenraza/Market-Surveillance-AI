// frontend/src/components/common/Loading.jsx
import React from 'react';

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 border-4 border-primary-200 rounded-full"></div>
          {/* Inner spinning ring */}
          <div className="w-20 h-20 border-4 border-primary-800 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading Market Surveillance AI...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait</p>
      </div>
    </div>
  );
};

export default Loading;