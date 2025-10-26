import { useState, useEffect } from 'react';

/**
 * Custom hook for managing AviationStack API key with localStorage persistence
 *
 * This hook provides:
 * - Automatic loading of API key from localStorage on mount
 * - Automatic saving of API key to localStorage when it changes
 * - Method to clear the API key from both state and localStorage
 *
 * @returns {Object} Object containing:
 *   - apiKey: The current API key value (string)
 *   - setApiKey: Function to update the API key
 *   - clearApiKey: Function to clear the API key from storage
 */
const useApiKey = () => {
  // The localStorage key where we'll store the API key
  const STORAGE_KEY = 'aviationstack_api_key';

  // Initialize state from localStorage, or empty string if nothing saved
  const [apiKey, setApiKey] = useState(() => {
    try {
      // Get the stored API key when the component first mounts
      const storedKey = localStorage.getItem(STORAGE_KEY);
      return storedKey || '';
    } catch (error) {
      // If localStorage is not available (rare), log error and return empty string
      console.error('Failed to load API key from localStorage:', error);
      return '';
    }
  });

  // Effect to save API key to localStorage whenever it changes
  useEffect(() => {
    try {
      if (apiKey) {
        // Save the API key to localStorage
        localStorage.setItem(STORAGE_KEY, apiKey);
      } else {
        // If API key is empty, remove it from localStorage
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      // Handle potential localStorage errors (quota exceeded, private mode, etc.)
      console.error('Failed to save API key to localStorage:', error);
    }
  }, [apiKey]); // Only re-run when apiKey changes

  /**
   * Clears the API key from both state and localStorage
   */
  const clearApiKey = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey('');
    } catch (error) {
      console.error('Failed to clear API key from localStorage:', error);
    }
  };

  return {
    apiKey,
    setApiKey,
    clearApiKey,
  };
};

export default useApiKey;
