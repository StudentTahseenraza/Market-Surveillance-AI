// src/context/WebSocketContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import websocketService from '@api/websocket';
import { useAuth } from '@hooks/useAuth';
import { toast } from 'react-toastify';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    websocketService.connect();

    websocketService.on('connect', (data) => {
      setConnected(data.connected);
    });

    websocketService.on('disconnect', (data) => {
      setConnected(data.connected);
    });

    websocketService.on('anomaly', (data) => {
      setLastMessage(data);
      setAlerts(prev => [data, ...prev].slice(0, 50));
      
      // Show toast notification
      toast.warning(
        <div>
          <strong>🚨 Anomaly Detected!</strong>
          <br />
          {data.symbol} - Risk Score: {data.risk_score}
          <br />
          <span className="text-sm">Type: {data.anomaly_type}</span>
        </div>,
        {
          position: "top-right",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        }
      );
    });

    websocketService.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('Real-time connection error');
    });

    return () => {
      websocketService.off('connect');
      websocketService.off('disconnect');
      websocketService.off('anomaly');
      websocketService.off('error');
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const value = {
    connected,
    alerts,
    lastMessage,
    clearAlerts,
    isConnected: websocketService.isConnected(),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;