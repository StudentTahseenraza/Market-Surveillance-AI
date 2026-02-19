// src/hooks/useStockData.js
import { useState, useEffect, useCallback } from 'react';
import { stocksAPI } from '@api/stocks';
import { toast } from 'react-toastify';

export const useStockData = (symbol, startDate, endDate) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await stocksAPI.getStockData(symbol, startDate, endDate);
      setData(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch stock data');
      toast.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol, startDate, endDate]);

  const fetchAnomalies = useCallback(async () => {
    if (!symbol) return;
    
    try {
      const response = await stocksAPI.getAnomalies(symbol);
      setAnomalies(response);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    }
  }, [symbol]);

  const analyze = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    
    try {
      const result = await stocksAPI.analyzeStock(symbol);
      setAnalysisResult(result);
      toast.success(`Analysis complete! Found ${result.anomalies_found} anomalies`);
      await fetchAnomalies();
      return result;
    } catch (err) {
      toast.error('Analysis failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [symbol, fetchAnomalies]);

  const uploadCSV = useCallback(async (file, customSymbol) => {
    setLoading(true);
    
    try {
      const result = await stocksAPI.uploadCSV(file, customSymbol || symbol);
      toast.success(`Uploaded ${result.records} records successfully`);
      await fetchData();
      return result;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [symbol, fetchData]);

  const generateReport = useCallback(async () => {
    if (!symbol) return;
    
    try {
      const blob = await stocksAPI.generateReport(symbol);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market_surveillance_${symbol}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report generated successfully');
    } catch (err) {
      toast.error('Failed to generate report');
      throw err;
    }
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      fetchData();
      fetchAnomalies();
    }
  }, [symbol, fetchData, fetchAnomalies]);

  return {
    data,
    loading,
    error,
    anomalies,
    analysisResult,
    analyze,
    uploadCSV,
    generateReport,
    refresh: fetchData,
  };
};