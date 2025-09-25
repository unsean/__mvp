/**
 * Error handling utility for consistent error messages across the app
 * Use this instead of direct Alert.alert() or console.error() calls
 */

// Error mapping for user-friendly messages
const ERROR_MESSAGES = {
  // Auth errors
  'invalid_credentials': 'Incorrect email or password.',
  'user_not_found': 'This account does not exist.',
  'email_taken': 'This email address is already in use.',
  'weak_password': 'Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.',
  'expired_otp': 'Verification code has expired. Please request a new one.',
  'invalid_otp': 'Invalid verification code. Please check and try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  
  // Network errors
  'network_error': 'Network connection issue. Please check your internet and try again.',
  'server_error': 'Server error occurred. Please try again later.',
  'timeout': 'Request timed out. Please check your connection and try again.',
  
  // Data errors
  'not_found': 'The requested information was not found.',
  'permission_denied': 'You do not have permission to perform this action.',
  'invalid_data': 'The data provided is invalid.',
  
  // Fallback messages
  'default': 'An unexpected error occurred. Please try again.'
};

/**
 * Get a user-friendly error message from an error code or object
 * @param {string|Error} error - Error code, message or object
 * @param {string} fallbackMessage - Optional custom fallback message
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallbackMessage = null) => {
  // Handle string error codes
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }
  
  // Handle error objects
  if (error && typeof error === 'object') {
    // Supabase error
    if (error.code) {
      return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES.default;
    }
    
    // General error with message property
    if (error.message) {
      // Check if message contains any known error patterns
      for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
        if (error.message.toLowerCase().includes(code.toLowerCase())) {
          return message;
        }
      }
      return error.message;
    }
  }
  
  return fallbackMessage || ERROR_MESSAGES.default;
};

/**
 * Log error details to console with consistent format
 * @param {string} source - Where the error occurred (component/function name)
 * @param {Error|string} error - The error object or message
 * @param {object} context - Additional context information
 */
export const logError = (source, error, context = {}) => {
  console.error(`[${source}] Error:`, error);
  if (Object.keys(context).length > 0) {
    console.error(`[${source}] Context:`, context);
  }
};

/**
 * Create error handler for a specific component with customized settings
 * @param {string} componentName - Component identifier for logging
 * @returns {object} Component-specific error handler methods
 */
export const createErrorHandler = (componentName) => {
  return {
    handleError: (error, fallback = null) => {
      logError(componentName, error);
      return getErrorMessage(error, fallback);
    },
    
    // Log error with specific context information
    logWithContext: (error, context = {}) => {
      logError(componentName, error, context);
    }
  };
};

export default {
  getErrorMessage,
  logError,
  createErrorHandler
};
