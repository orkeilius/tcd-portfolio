/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
