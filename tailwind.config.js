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
        background: '#FDFDFB',
        foreground: '#0F1713',
        card: '#FFFFFF',
        'card-foreground': '#0F1713',
        border: '#E1E4DF',
        primary: '#10BC79',
        'primary-foreground': '#FFFFFF',
        secondary: '#F0F2EF',
        'secondary-foreground': '#405045',
        muted: '#F5F6F3',
        'muted-foreground': '#607065',
        destructive: '#E11D48',
        'destructive-foreground': '#FFFFFF',
        
        'tint-blue': '#EBF4FF',
        'text-blue': '#1E40AF',
        'border-blue': '#BFDBFE',
        
        'tint-emerald': '#ECFDF5',
        'text-emerald': '#065F46',
        'border-emerald': '#A7F3D0',

        'tint-amber': '#FEF3C7',
        'text-amber': '#92400E',
        'border-amber': '#FDE68A',

        'tint-rose': '#FFE4E6',
        'text-rose': '#BE123C',
        'border-rose': '#FECDD3',
        
        'tint-purple': '#F3E8FF',
        'text-purple': '#6B21A8',
        'border-purple': '#E9D5FF',
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
