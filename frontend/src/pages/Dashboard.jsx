// frontend/src/pages/Dashboard.jsx (add loading check)
import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useStockData } from '@hooks/useStockData';
import { useWebSocket } from '@hooks/useWebSocket';
import StatCard from '@components/dashboard/StatCard';
import AnomaliesTable from '@components/dashboard/AnomaliesTable';
import RiskDistribution from '@components/dashboard/RiskDistribution';
import CandlestickChart from '@components/charts/CandlestickChart';
import VolumeChart from '@components/charts/VolumeChart';
import RiskGauge from '@components/charts/RiskGauge';
import Loading from '@components/common/Loading';
import { 
  ArrowPathIcon, 
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { isAnalyst } = useAuth();
  const { alerts } = useWebSocket();
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [symbols, setSymbols] = useState([]);
  const [stats, setStats] = useState({
    totalAnomalies: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgRiskScore: 0,
  });

  const {
    data: stockData,
    anomalies,
    loading,
    analyze,
    generateReport,
  } = useStockData(selectedSymbol);

  useEffect(() => {
    // Calculate statistics
    if (anomalies?.length > 0) {
      const high = anomalies.filter(a => a.risk_level === 'High').length;
      const medium = anomalies.filter(a => a.risk_level === 'Medium').length;
      const low = anomalies.filter(a => a.risk_level === 'Low').length;
      const avgScore = anomalies.reduce((acc, a) => acc + a.risk_score, 0) / anomalies.length;

      setStats({
        totalAnomalies: anomalies.length,
        highRisk: high,
        mediumRisk: medium,
        lowRisk: low,
        avgRiskScore: avgScore.toFixed(1),
      });
    }
  }, [anomalies]);

  // Get unique symbols from alerts
  useEffect(() => {
    const uniqueSymbols = [...new Set(alerts.map(a => a.symbol))];
    if (uniqueSymbols.length > 0) {
      setSymbols(prev => [...new Set([...prev, ...uniqueSymbols])]);
    }
  }, [alerts]);

  if (loading && !stockData.length) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time market surveillance and anomaly detection
          </p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="RELIANCE">RELIANCE</option>
            <option value="TCS">TCS</option>
            <option value="HDFCBANK">HDFC Bank</option>
            <option value="INFY">Infosys</option>
            <option value="ICICIBANK">ICICI Bank</option>
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          
          {isAnalyst && (
            <>
              <button
                onClick={() => analyze()}
                disabled={loading}
                className="btn-primary inline-flex items-center"
              >
                <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
              
              <button
                onClick={() => generateReport()}
                className="btn-outline inline-flex items-center"
              >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Anomalies"
          value={stats.totalAnomalies}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          icon={ChartBarIcon}
          color="red"
        />
        <StatCard
          title="Medium Risk"
          value={stats.mediumRisk}
          icon={ChartBarIcon}
          color="yellow"
        />
        <StatCard
          title="Low Risk"
          value={stats.lowRisk}
          icon={ChartBarIcon}
          color="green"
        />
        <StatCard
          title="Avg Risk Score"
          value={stats.avgRiskScore}
          icon={CurrencyDollarIcon}
          color="blue"
          suffix="/100"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candlestick Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedSymbol} - Price Movement
            </h2>
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Last 30 Days
            </span>
          </div>
          <div className="h-80">
            <CandlestickChart data={stockData?.slice(-30)} anomalies={anomalies} />
          </div>
        </div>

        {/* Risk Gauge */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current Risk Score
          </h2>
          <div className="h-64">
            <RiskGauge 
              value={stats.avgRiskScore || 0} 
              max={100}
              thresholds={{ low: 30, medium: 70 }}
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risk Level:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                stats.avgRiskScore > 70 ? 'bg-red-100 text-red-800' :
                stats.avgRiskScore > 30 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {stats.avgRiskScore > 70 ? 'High' :
                 stats.avgRiskScore > 30 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Trading Volume Analysis
          </h2>
          <div className="h-64">
            <VolumeChart data={stockData?.slice(-30)} anomalies={anomalies} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Risk Distribution
          </h2>
          <div className="h-64">
            <RiskDistribution anomalies={anomalies} />
          </div>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Anomalies
          </h2>
          <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
            View All
          </button>
        </div>
        <AnomaliesTable anomalies={anomalies?.slice(0, 10)} />
      </div>
    </div>
  );
};

export default Dashboard;