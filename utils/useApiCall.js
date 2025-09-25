import { useState, useCallback } from 'react';
import { logError, getErrorMessage } from './errorHandler';

/**
 * Hook for making API calls with consistent loading and error states
 * 
 * @param {Function} apiFunction - The async API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - API call state and handler function
 */
export default function useApiCall(apiFunction, options = {}) {
  const {
    autoExecute = false,
    onSuccess,
    onError,
    initialLoading = false,
    initialData = null,
    initialError = null,
    shouldLogError = true,
    sourceComponent = 'useApiCall'
  } = options;

  const [loading, setLoading] = useState(initialLoading);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);

  /**
   * Execute the API call with provided parameters
   * @param {Array} args - Arguments to pass to the API function
   * @returns {Promise} - Result of the API call
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (shouldLogError) {
        logError(`${sourceComponent}.apiCall`, err);
      }
      
      if (onError) {
        onError(err, errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, shouldLogError, sourceComponent]);

  // Auto-execute if configured
  useState(() => {
    if (autoExecute) {
      execute();
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setLoading(initialLoading);
    setData(initialData);
    setError(initialError);
  }, [initialLoading, initialData, initialError]);

  return {
    loading,
    data,
    error,
    execute,
    reset
  };
}
