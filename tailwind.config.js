/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins-Regular", "sans-serif"],
        "poppins-bold": ["Poppins-Bold", "sans-serif"],
        "poppins-semibold": ["Poppins-Bold", "sans-serif"],
        prostoOne: ["ProstoOne-Regular", "cursive"],
        sans: ["Poppins-Regular", "sans-serif"],
      },
    },
  },
  plugins: [],
};