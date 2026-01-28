/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-green-100',
    'text-green-800',
    'border-green-300',
    'bg-yellow-100',
    'text-yellow-800',
    'border-yellow-300',
    'bg-orange-100',
    'text-orange-800',
    'border-orange-300',
    'bg-red-100',
    'text-red-800',
    'border-red-300',
    'bg-gray-100',
    'text-gray-800',
    'border-gray-300',
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
