/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brandGold: "#d49539",
        brandNavy: "#304b62",
        brandCream: "#f6d6a0",
        brandSlate: "#37464e",
        brandLight: "#ebecf3",
      },
    },
  },
  plugins: [],
}
