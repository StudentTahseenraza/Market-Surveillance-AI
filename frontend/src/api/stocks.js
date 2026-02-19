// src/api/stocks.js
import api from './axios';

export const stocksAPI = {
  // Get all symbols
  getSymbols: async () => {
    const response = await api.get('/stocks/symbols');
    return response.data;
  },

  // Get stock data
  getStockData: async (symbol, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get(`/stocks/data/${symbol}`, { params });
    return response.data;
  },

  // Upload CSV
  uploadCSV: async (file, symbol) => {
    const formData = new FormData();
    formData.append('file', file);
    if (symbol) formData.append('symbol', symbol);
    
    const response = await api.post('/stocks/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Run analysis
  analyzeStock: async (symbol) => {
    const response = await api.post(`/stocks/analyze/${symbol}`);
    return response.data;
  },

  // Get anomalies
  getAnomalies: async (symbol) => {
    const response = await api.get(`/stocks/anomalies/${symbol}`);
    return response.data;
  },

  // Generate report
  generateReport: async (symbol) => {
    const response = await api.get(`/reports/generate/${symbol}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get audit logs
  getAuditLogs: async () => {
    const response = await api.get('/reports/audit-logs');
    return response.data;
  },
};