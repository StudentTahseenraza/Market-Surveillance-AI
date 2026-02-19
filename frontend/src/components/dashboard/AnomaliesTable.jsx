// src/components/dashboard/AnomaliesTable.jsx
import React from 'react';
import { format } from 'date-fns';

const AnomaliesTable = ({ anomalies = [] }) => {
  if (!anomalies.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No anomalies detected</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Z-Score (Price)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Z-Score (Volume)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {anomalies.map((anomaly) => (
            <tr 
              key={anomaly.id}
              className={anomaly.risk_level === 'High' ? 'bg-red-50' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(anomaly.date), 'dd MMM yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  anomaly.anomaly_type.includes('Price') 
                    ? 'bg-orange-100 text-orange-800'
                    : anomaly.anomaly_type.includes('Volume')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {anomaly.anomaly_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        anomaly.risk_score > 70 ? 'bg-red-600' :
                        anomaly.risk_score > 30 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${anomaly.risk_score}%` }}
                    />
                  </div>
                  {anomaly.risk_score.toFixed(1)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  anomaly.risk_level === 'High' 
                    ? 'bg-red-100 text-red-800'
                    : anomaly.risk_level === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {anomaly.risk_level}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {anomaly.zscore_price?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {anomaly.zscore_volume?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnomaliesTable;