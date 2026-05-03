/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: '#00d4ff',
        'neon-dark': '#0099bb',
        surface: '#111827',
        'surface-2': '#1a2235',
        'surface-3': '#1f2a40',
        dark: '#0a0f1e',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
