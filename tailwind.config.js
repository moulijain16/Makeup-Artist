/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
   cream: "#FBF3EC",
        blush: "#F0DAD6",
        rose: {
          DEFAULT: "#9C3B4E",
          dark: "#732B39",
          light: "#C97C88",
        },
        gold: "#B98B45",
        ink: "#2E241F",
        sage: "#6E7B5C",
      },
      fontFamily: {
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "URW Palladio L",
          "Georgia",
          "serif",
        ],
        body: [
          "Avenir Next",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(46, 36, 31, 0.25)",
      },
    },
  },
  plugins: [],
};
