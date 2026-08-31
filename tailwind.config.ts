import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1F3D7A',
          dark: '#152C5C',
          light: '#2A4A94',
        },
        bg: '#F0F2F7',
        surface: {
          DEFAULT: '#FFFFFF',
          1: '#F8F9FB',
          2: '#EEF0F4',
        },
        text: {
          DEFAULT: '#14162B',
          2: '#535870',
          3: '#8B90A5',
        },
        border: {
          DEFAULT: '#E5E7EE',
          2: '#D3D7E1',
        },
        finance: {
          green: '#0A6B3E',
          red: '#CC0000',
          gold: '#B87D00',
          blue: '#1F3D7A',
        },
        sidebar: {
          DEFAULT: '#F7F8FA',
          bg: '#F7F8FA',
          border: '#E3E6EF',
          text: '#1A2038',
          muted: '#7B82A0',
          activeBg: '#1F3D7A',
          activeText: '#FFFFFF',
          hoverBg: '#EEF0F8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Poppins', 'Inter', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(20, 22, 43, 0.04)',
        sm: '0 1px 2px rgba(20, 22, 43, 0.06)',
        DEFAULT: '0 2px 8px rgba(20, 22, 43, 0.08), 0 1px 2px rgba(20, 22, 43, 0.04)',
        md: '0 8px 24px rgba(20, 22, 43, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
