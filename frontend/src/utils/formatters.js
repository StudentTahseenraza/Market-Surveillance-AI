// frontend/src/utils/formatters.js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
};

export const formatPercentage = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const formatVolume = (value) => {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + 'K';
  }
  return value.toString();
};