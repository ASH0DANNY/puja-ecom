/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e6c40e", // Yellow color
      },
    },
  },
  plugins: [],
  darkMode: "class", // Enable dark mode if needed
};
