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
        background: '#FAF8F5',
        foreground: '#2A2A28',
        card: '#FFFFFF',
        'card-foreground': '#2A2A28',
        border: '#E8E5DF',
        primary: '#D85A42', /* Terracotta */
        'primary-foreground': '#FFFFFF',
        secondary: '#F2EFE9',
        'secondary-foreground': '#5C5B57',
        muted: '#F5F3ED',
        'muted-foreground': '#7A7873',
        destructive: '#C94F4F',
        'destructive-foreground': '#FFFFFF',
        'accent-green': '#5A7D65', /* Sage */
        'accent-yellow': '#E6A845', /* Ochre */
        'accent-blue': '#4B6B7A', /* Slate Blue */
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
