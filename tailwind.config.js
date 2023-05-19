/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        'accent': '#0e73b8',
        'accentHover': '#0f6eae',
        'accent2': '#35b8d6',
        'boutton1':'#eff0f1',
        'text': '#53565a'
      },
      screens: {
        'lg': '1180px'
      }
    },
  },
  plugins: [],
}

