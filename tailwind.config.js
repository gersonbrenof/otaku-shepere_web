/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6', 
        secondary: '#ec4899', 
        dark: '#0f172a', 
        darkCard: '#1e293b' 
      }
    },
  },
  plugins: [],
}