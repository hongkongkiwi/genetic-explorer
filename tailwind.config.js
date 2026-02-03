/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dna: {
          a: '#22c55e',
          t: '#3b82f6',
          c: '#f59e0b',
          g: '#ef4444',
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        }
      },
      animation: {
        'dna-spin': 'dna-spin 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'dna-spin': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
