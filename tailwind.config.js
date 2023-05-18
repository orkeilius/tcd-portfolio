/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        'accent': '#0e73b8',
        'accentHover':'#0f6eae',
        'text': '#53565a'
      },
      screens: {
        'lg': '1180px'
      }
    },
  },
  plugins: [],
}

