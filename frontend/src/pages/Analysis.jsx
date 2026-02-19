// frontend/src/pages/Analysis.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useStockData } from '@hooks/useStockData';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Analysis = () => {
  const { symbol: urlSymbol } = useParams();
  const { isAnalyst } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState(urlSymbol || 'RELIANCE');
  const [symbols, setSymbols] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [analysisType, setAnalysisType] = useState('price');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [thresholds, setThresholds] = useState({
    priceZscore: 2.5,
    volumeZscore: 2.5,
    volatilityWindow: 20
  });

  const {
    data: stockData,
    anomalies,
    loading,
    analysisResult,
    analyze,
    generateReport
  } = useStockData(selectedSymbol, dateRange.startDate, dateRange.endDate);

  useEffect(() => {
    fetchSymbols();
  }, []);

  const fetchSymbols = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/stocks/symbols', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSymbols(data);
    } catch (error) {
      console.error('Error fetching symbols:', error);
    }
  };

  const handleAnalyze = async () => {
    await analyze();
    toast.success('Analysis complete!');
  };

  const handleExportCSV = () => {
    if (!stockData.length) return;
    
    const csv = [
      ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Returns', 'Volatility'],
      ...stockData.map(d => [
        d.date,
        d.open,
        d.high,
        d.low,
        d.close,
        d.volume,
        ((d.close - d.open) / d.open * 100).toFixed(2) + '%',
        ((d.high - d.low) / d.low * 100).toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSymbol}_analysis_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully!');
  };

  // Prepare chart data
  const chartData = stockData.map(d => ({
    date: format(new Date(d.date), 'dd MMM'),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume / 1000000, // Convert to millions
    returns: ((d.close - d.open) / d.open * 100).toFixed(2),
    volatility: ((d.high - d.low) / d.low * 100).toFixed(2),
    isAnomaly: anomalies?.some(a => a.date === d.date)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analysis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Deep dive into stock performance and anomaly detection
          </p>
        </div>
        
        <div className="flex space-x-3">
          {isAnalyst && (
            <>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary inline-flex items-center"
              >
                <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
              
              <button
                onClick={handleExportCSV}
                className="btn-outline inline-flex items-center"
              >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {symbols.map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="price">Price Analysis</option>
              <option value="volume">Volume Analysis</option>
              <option value="volatility">Volatility Analysis</option>
              <option value="returns">Returns Analysis</option>
            </select>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium inline-flex items-center"
          >
            <FunnelIcon className="w-4 h-4 mr-1" />
            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Z-Score Threshold
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.priceZscore}
                onChange={(e) => setThresholds({ ...thresholds, priceZscore: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume Z-Score Threshold
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.volumeZscore}
                onChange={(e) => setThresholds({ ...thresholds, volumeZscore: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volatility Window (days)
              </label>
              <input
                type="number"
                value={thresholds.volatilityWindow}
                onChange={(e) => setThresholds({ ...thresholds, volatilityWindow: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Summary */}
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{analysisResult.total_records}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Anomalies Found</p>
            <p className="text-2xl font-bold text-red-600">{analysisResult.anomalies_found}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">High Risk</p>
            <p className="text-2xl font-bold text-red-600">{analysisResult.high_risk}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Medium Risk</p>
            <p className="text-2xl font-bold text-yellow-600">{analysisResult.medium_risk}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Avg Risk Score</p>
            <p className="text-2xl font-bold text-blue-600">{analysisResult.avg_risk_score?.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedSymbol} - {analysisType === 'price' && 'Price Movement'}
          {analysisType === 'volume' && 'Volume Analysis'}
          {analysisType === 'volatility' && 'Volatility Analysis'}
          {analysisType === 'returns' && 'Returns Analysis'}
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {analysisType === 'price' && (
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="close" stroke="#2563eb" name="Close Price" />
                <Line yAxisId="left" type="monotone" dataKey="open" stroke="#10b981" name="Open Price" />
                <Area yAxisId="right" type="monotone" dataKey="volume" fill="#f59e0b" stroke="#f59e0b" name="Volume" />
              </ComposedChart>
            )}
            {analysisType === 'volume' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#f59e0b" name="Volume (Millions)" />
              </BarChart>
            )}
            {analysisType === 'volatility' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volatility" stroke="#ef4444" name="Volatility %" />
              </LineChart>
            )}
            {analysisType === 'returns' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="returns" fill="#8b5cf6" name="Daily Returns %" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">High</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returns %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anomaly</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.slice(-20).map((row, idx) => (
                <tr key={idx} className={row.isAnomaly ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.open?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.high?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.low?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.close?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.volume?.toFixed(2)}M</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.returns}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.isAnomaly && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Anomaly
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analysis;