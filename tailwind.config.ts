import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008B7F',
          50: '#E6F7F5',
          100: '#CCEFEB',
          200: '#99DFD7',
          300: '#66CFC3',
          400: '#33BFAF',
          500: '#008B7F',
          600: '#007066',
          700: '#00544D',
          800: '#003833',
          900: '#001C1A',
        },
        accent: {
          DEFAULT: '#C8102E',
          50: '#FEE7EB',
          100: '#FDCFD6',
          200: '#FB9FAD',
          300: '#F96F84',
          400: '#F73F5B',
          500: '#C8102E',
          600: '#A00D25',
          700: '#780A1C',
          800: '#500713',
          900: '#280309',
        },
        secondary: {
          DEFAULT: '#E8967D',
          50: '#FDF5F2',
          100: '#FBEBE5',
          200: '#F7D7CB',
          300: '#F3C3B1',
          400: '#EFAF97',
          500: '#E8967D',
          600: '#BA7864',
          700: '#8B5A4B',
          800: '#5D3C32',
          900: '#2E1E19',
        },
        neutral: {
          DEFAULT: '#7E7E7E',
          50: '#F8F8F8',
          100: '#F1F1F1',
          200: '#E3E3E3',
          300: '#C7C7C7',
          400: '#A2A2A2',
          500: '#7E7E7E',
          600: '#656565',
          700: '#4C4C4C',
          800: '#323232',
          900: '#191919',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        subtle: '0 1px 3px 0 rgb(0 0 0 / 0.02), 0 1px 2px -1px rgb(0 0 0 / 0.01)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

export default config