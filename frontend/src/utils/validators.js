// frontend/src/utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validateStockSymbol = (symbol) => {
  // Stock symbols are usually uppercase letters, 1-5 characters
  const re = /^[A-Z]{1,5}$/;
  return re.test(symbol);
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateRiskScore = (score) => {
  return score >= 0 && score <= 100;
};