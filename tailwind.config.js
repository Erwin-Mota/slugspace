/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ucsc-navy': '#00274C',
        'ucsc-yellow': '#FFCB05',
      },
      animation: {
        'pulse': 'pulse 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
} 