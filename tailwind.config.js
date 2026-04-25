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
        background: '#E4E4E7',
        foreground: '#0F1713',
        card: '#F5F6F3',
        'card-foreground': '#0F1713',
        border: '#E1E4DF',
        primary: '#10BC79',
        'primary-foreground': '#FFFFFF',
        secondary: '#E8EBE6',
        'secondary-foreground': '#405045',
        muted: '#F0F2EF',
        'muted-foreground': '#607065',
        destructive: '#E53E3E',
        'destructive-foreground': '#FFFFFF',
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
