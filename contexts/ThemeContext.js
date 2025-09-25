import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import theme variables
import { colors, darkColors } from '../theme/colors';
import { fontSizes } from '../theme/typography';
import { shadow } from '../theme/shadows';

// Create theme context
const ThemeContext = createContext();

// Theme keys
const THEME_KEY = '@app_theme_preference';
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Theme Provider Component
 */
export const ThemeProvider = ({ children }) => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();
  
  // Theme state
  const [themePreference, setThemePreference] = useState(THEME_OPTIONS.SYSTEM);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize theme from storage
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme) {
          setThemePreference(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadThemePreference();
  }, []);
  
  // Calculate current theme based on preference
  const isDarkMode = themePreference === THEME_OPTIONS.SYSTEM 
    ? systemColorScheme === 'dark'
    : themePreference === THEME_OPTIONS.DARK;
  
  // Set theme function
  const setTheme = async (theme) => {
    setThemePreference(theme);
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };
  
  // Current theme colors
  const theme = {
    colors: isDarkMode ? darkColors : colors,
    fontSizes: fontSizes,
    shadows: isDarkMode ? {} : shadow, // Adjust shadows for dark mode if needed
    isDark: isDarkMode,
  };
  
  // Context value
  const contextValue = {
    theme,
    themePreference,
    setTheme,
    isDarkMode,
    themeOptions: THEME_OPTIONS
  };
  
  if (isLoading) {
    // Return a minimal placeholder while loading
    return null;
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme in components
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
