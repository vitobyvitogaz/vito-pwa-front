// src/styles/theme.ts

export const colors = {
  // Couleurs principales Vitogaz
  primary: {
    DEFAULT: '#008B7F',    // Vert Vitogaz principal
    50: '#E6F7F5',
    100: '#CCEFEB',
    200: '#99DFD7',
    300: '#66CFC3',
    400: '#33BFAF',
    500: '#008B7F',         // Base
    600: '#007066',
    700: '#00544D',
    800: '#003833',
    900: '#001C1A',
  },
  
  accent: {
    DEFAULT: '#C8102E',     // Rouge flamme
    50: '#FEE7EB',
    100: '#FDCFD6',
    200: '#FB9FAD',
    300: '#F96F84',
    400: '#F73F5B',
    500: '#C8102E',         // Base
    600: '#A00D25',
    700: '#780A1C',
    800: '#500713',
    900: '#280309',
  },
  
  secondary: {
    DEFAULT: '#E8967D',     // Orange corail
    50: '#FDF5F2',
    100: '#FBEBE5',
    200: '#F7D7CB',
    300: '#F3C3B1',
    400: '#EFAF97',
    500: '#E8967D',         // Base
    600: '#BA7864',
    700: '#8B5A4B',
    800: '#5D3C32',
    900: '#2E1E19',
  },
  
  neutral: {
    DEFAULT: '#7E7E7E',     // Gris Madagascar
    50: '#F8F8F8',
    100: '#F1F1F1',
    200: '#E3E3E3',
    300: '#C7C7C7',
    400: '#A2A2A2',
    500: '#7E7E7E',         // Base
    600: '#656565',
    700: '#4C4C4C',
    800: '#323232',
    900: '#191919',
  },
  
  // États
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Thème clair
  light: {
    bg: '#FFFFFF',
    surface: '#F8F9FA',
    border: '#E5E7EB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    }
  },
  
  // Thème sombre
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    border: '#334155',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
    }
  }
}

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    display: ['Montserrat', 'Inter', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
}

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
}

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
}