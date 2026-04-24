/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        card: '#111111',
        'card-foreground': '#fafafa',
        border: 'rgba(255,255,255,0.1)',
        primary: '#22c55e',
        'primary-foreground': '#000000',
        secondary: '#1a1a1a',
        'secondary-foreground': '#fafafa',
        muted: '#171717',
        'muted-foreground': '#737373',
        destructive: '#ef4444',
        'destructive-foreground': '#fafafa',
      },
    },
  },
  plugins: [],
}
