// frontend/src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { format } from 'date-fns';
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Reports = () => {
  const { isAdmin, isAnalyst } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState({
    symbol: 'all',
    dateRange: 'week',
    type: 'all'
  });
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    fetchReports();
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

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockReports = [
        {
          id: 1,
          name: 'RELIANCE - Quarterly Analysis',
          symbol: 'RELIANCE',
          type: 'Quarterly',
          generatedBy: 'admin',
          generatedAt: new Date(),
          size: '2.4 MB',
          status: 'completed',
          riskScore: 45,
          anomalies: 12
        },
        {
          id: 2,
          name: 'TCS - Monthly Surveillance',
          symbol: 'TCS',
          type: 'Monthly',
          generatedBy: 'analyst',
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          size: '1.8 MB',
          status: 'completed',
          riskScore: 28,
          anomalies: 5
        },
        {
          id: 3,
          name: 'HDFCBANK - Weekly Report',
          symbol: 'HDFCBANK',
          type: 'Weekly',
          generatedBy: 'analyst',
          generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          size: '0.9 MB',
          status: 'completed',
          riskScore: 72,
          anomalies: 18
        },
        {
          id: 4,
          name: 'INFY - Daily Surveillance',
          symbol: 'INFY',
          type: 'Daily',
          generatedBy: 'system',
          generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          size: '0.5 MB',
          status: 'processing',
          riskScore: 15,
          anomalies: 2
        }
      ];
      setReports(mockReports);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const generateNewReport = async (symbol, type) => {
    try {
      toast.info(`Generating ${type} report for ${symbol}...`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport = {
        id: reports.length + 1,
        name: `${symbol} - ${type} Analysis`,
        symbol,
        type,
        generatedBy: 'admin',
        generatedAt: new Date(),
        size: '1.2 MB',
        status: 'completed',
        riskScore: Math.floor(Math.random() * 100),
        anomalies: Math.floor(Math.random() * 20)
      };
      
      setReports([newReport, ...reports]);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const downloadReport = async (reportId) => {
    try {
      toast.info('Preparing download...');
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create dummy PDF
      const element = document.createElement('a');
      const file = new Blob(['Dummy PDF content'], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = `report_${reportId}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const getRiskColor = (score) => {
    if (score > 70) return 'text-red-600 bg-red-100';
    if (score > 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredReports = reports.filter(report => {
    if (filter.symbol !== 'all' && report.symbol !== filter.symbol) return false;
    if (filter.type !== 'all' && report.type !== filter.type) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and manage surveillance reports
          </p>
        </div>
        
        {isAnalyst && (
          <button
            onClick={() => document.getElementById('generateModal').classList.remove('hidden')}
            className="btn-primary inline-flex items-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Generate New Report
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <select
              value={filter.symbol}
              onChange={(e) => setFilter({ ...filter, symbol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Symbols</option>
              {symbols.map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anomalies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(report.generatedAt, 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(report.riskScore)}`}>
                      {report.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.anomalies}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadReport(report.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      <div id="generateModal" className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Symbol
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {symbols.map(sym => (
                    <option key={sym} value={sym}>{sym}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Daily Report</option>
                  <option>Weekly Report</option>
                  <option>Monthly Report</option>
                  <option>Quarterly Report</option>
                  <option>Annual Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                  <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Include Sections
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Price Analysis</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Volume Analysis</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Anomaly Detection</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span className="ml-2 text-sm text-gray-600">Risk Assessment</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => document.getElementById('generateModal').classList.add('hidden')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generateNewReport('RELIANCE', 'Monthly');
                  document.getElementById('generateModal').classList.add('hidden');
                }}
                className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;