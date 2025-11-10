/**
 * Color Palette - Centralized color constants
 * Matches Tailwind config for consistency
 */

export const colors = {
  // Brand - Coral Red
  coral: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',  // Primary brand color
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Dark Theme
  dark: {
    bg: '#000000',        // Pure black background
    surface: '#121212',   // Elevated surfaces
    card: '#1E1E1E',      // Cards, modals
    border: '#2C2C2C',    // Borders
    hover: '#262626',     // Hover states
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#737373',
    disabled: '#4D4D4D',
  },

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Category Colors (for badges/chips)
  category: {
    rent: '#2196F3',      // Blue
    buy: '#4CAF50',       // Green
    food: '#FF9800',      // Orange
    services: '#9C27B0',  // Purple
  },

  // Gradients
  gradients: {
    coral: 'linear-gradient(135deg, #EF5350 0%, #FF8A80 100%)',
    dark: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // Opacity variants
  opacity: {
    coral: {
      10: 'rgba(239, 83, 80, 0.1)',
      20: 'rgba(239, 83, 80, 0.2)',
      30: 'rgba(239, 83, 80, 0.3)',
      40: 'rgba(239, 83, 80, 0.4)',
      50: 'rgba(239, 83, 80, 0.5)',
    },
    white: {
      10: 'rgba(255, 255, 255, 0.1)',
      20: 'rgba(255, 255, 255, 0.2)',
      30: 'rgba(255, 255, 255, 0.3)',
      50: 'rgba(255, 255, 255, 0.5)',
      70: 'rgba(255, 255, 255, 0.7)',
    },
    black: {
      10: 'rgba(0, 0, 0, 0.1)',
      20: 'rgba(0, 0, 0, 0.2)',
      30: 'rgba(0, 0, 0, 0.3)',
      50: 'rgba(0, 0, 0, 0.5)',
      70: 'rgba(0, 0, 0, 0.7)',
      80: 'rgba(0, 0, 0, 0.8)',
    },
  },
} as const;

export type ColorPalette = typeof colors;

export default colors;
