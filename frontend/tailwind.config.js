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
        amazon: {
          orange: '#FF9900',
          dark: '#131921',
          navy: '#232F3E',
          blue: '#37475A',
          light: '#FEBD69',
          red: '#B12704',
          green: '#007600',
        }
      },
      fontFamily: {
        sans: ['Amazon Ember', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
