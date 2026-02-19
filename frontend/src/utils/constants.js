// frontend/src/utils/constants.js
export const STOCK_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
  'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT',
  'WIPRO', 'AXISBANK', 'MARUTI', 'SUNPHARMA', 'TATAMOTORS'
];

export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

export const RISK_COLORS = {
  [RISK_LEVELS.LOW]: 'green',
  [RISK_LEVELS.MEDIUM]: 'yellow',
  [RISK_LEVELS.HIGH]: 'red'
};

export const ANOMALY_TYPES = {
  PRICE: 'Price',
  VOLUME: 'Volume',
  BOTH: 'Both',
  ML_PATTERN: 'ML Pattern'
};

export const CHART_COLORS = {
  primary: '#1e3c72',
  secondary: '#dc3545',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gray: '#6b7280'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/token',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  STOCKS: {
    SYMBOLS: '/stocks/symbols',
    DATA: '/stocks/data',
    ANALYZE: '/stocks/analyze',
    ANOMALIES: '/stocks/anomalies',
    UPLOAD: '/stocks/upload'
  },
  REPORTS: {
    GENERATE: '/reports/generate',
    AUDIT_LOGS: '/reports/audit-logs'
  }
};

export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  API: 'yyyy-MM-dd',
  FILENAME: 'yyyyMMdd_HHmmss'
};