/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        script: ['Dancing Script', 'Pacifico', 'cursive'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
