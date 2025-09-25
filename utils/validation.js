// Validation utilities for forms and user input

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters long'
    };
  }
  
  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must be less than 50 characters'
    };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone) => {
  // Indonesian phone number validation
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const formatCurrency = (amount, currency = 'IDR') => {
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
};

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
