// frontend/src/pages/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { format } from 'date-fns';
import {
  ClockIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AuditLogs = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: 'all',
    user: 'all',
    dateRange: 'today'
  });
  const [stats, setStats] = useState({
    total: 0,
    logins: 0,
    analyses: 0,
    uploads: 0,
    exports: 0
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockLogs = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        user: ['admin', 'analyst', 'viewer'][Math.floor(Math.random() * 3)],
        action: ['LOGIN', 'ANALYSIS', 'UPLOAD', 'EXPORT', 'REPORT_GENERATE'][Math.floor(Math.random() * 5)],
        symbol: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', null][Math.floor(Math.random() * 5)],
        details: `Sample audit log entry ${i + 1}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        riskScore: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null
      })).sort((a, b) => b.timestamp - a.timestamp);

      setLogs(mockLogs);

      // Calculate stats
      const stats = mockLogs.reduce((acc, log) => {
        acc.total++;
        if (log.action === 'LOGIN') acc.logins++;
        if (log.action === 'ANALYSIS') acc.analyses++;
        if (log.action === 'UPLOAD') acc.uploads++;
        if (log.action === 'EXPORT') acc.exports++;
        return acc;
      }, { total: 0, logins: 0, analyses: 0, uploads: 0, exports: 0 });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'LOGIN':
        return <UserCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'ANALYSIS':
        return <ChartBarIcon className="w-5 h-5 text-purple-500" />;
      case 'UPLOAD':
        return <CloudArrowUpIcon className="w-5 h-5 text-green-500" />;
      case 'EXPORT':
      case 'REPORT_GENERATE':
        return <DocumentTextIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800';
      case 'ANALYSIS':
        return 'bg-purple-100 text-purple-800';
      case 'UPLOAD':
        return 'bg-green-100 text-green-800';
      case 'EXPORT':
      case 'REPORT_GENERATE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter.action !== 'all' && log.action !== filter.action) return false;
    if (filter.user !== 'all' && log.user !== filter.user) return false;
    return true;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only administrators can view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete trail of all system activities
          </p>
        </div>
        
        <button
          onClick={fetchLogs}
          className="btn-outline inline-flex items-center"
        >
          <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Logins</p>
          <p className="text-2xl font-bold text-blue-600">{stats.logins}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Analyses</p>
          <p className="text-2xl font-bold text-purple-600">{stats.analyses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Uploads</p>
          <p className="text-2xl font-bold text-green-600">{stats.uploads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Exports</p>
          <p className="text-2xl font-bold text-orange-600">{stats.exports}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="ANALYSIS">Analysis</option>
              <option value="UPLOAD">Upload</option>
              <option value="EXPORT">Export</option>
              <option value="REPORT_GENERATE">Report Generate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={filter.user}
              onChange={(e) => setFilter({ ...filter, user: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Users</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
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
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-8">
            <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(log.timestamp, 'dd MMM yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.symbol || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.riskScore ? (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          log.riskScore > 70 ? 'bg-red-100 text-red-800' :
                          log.riskScore > 30 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.riskScore}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;