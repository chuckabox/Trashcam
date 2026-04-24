/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        background: '#060a08',
        foreground: '#ddefd8',
        card: '#0c1510',
        'card-foreground': '#ddefd8',
        border: '#1c2d20',
        primary: '#b5f23d',
        'primary-foreground': '#060a08',
        secondary: '#101a13',
        'secondary-foreground': '#7a9e7a',
        muted: '#090e0b',
        'muted-foreground': '#4d6450',
        destructive: '#ff4d4d',
        'destructive-foreground': '#ffffff',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.97)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scan': {
          '0%': { top: '-2px', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.35s ease-out both',
        'scan': 'scan 2.8s linear infinite',
        'blink': 'blink 1.4s ease-in-out infinite',
        'spin': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
