/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#06090e',
          900: '#0b111e',
          850: '#111a2e',
          800: '#17233d',
          700: '#23365d',
          600: '#34528d',
          accent: '#06b6d4', // Neon Cyan
          primary: '#3b82f6', // Electric Blue
        },
        priority: {
          p1: '#ef4444', // Critical Red
          p2: '#f97316', // High Orange
          p3: '#eab308', // Medium Yellow
          p4: '#06b6d4', // Low Cyan
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
