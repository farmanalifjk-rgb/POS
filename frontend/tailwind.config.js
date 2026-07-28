/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{html,js}",
    "./pages/**/*.{html,js}",
    "./*.js",
  ],

  theme: {
    // Preserve Tailwind's sm/md/lg/xl/2xl breakpoints. Replacing this object
    // removed `lg:` utilities, so the Settings navigation occupied the full
    // page width and its selected content appeared far below the viewport.
    screens: {
      ...defaultTheme.screens,
      mmd: "992px",
    },

    extend: {
      colors: {
        sidebar: {
          bg: "#141922",
          card: "#1b212c",
          border: "#242b37",
        },

        accent: {
          DEFAULT: "#a3e635",
          dim: "rgba(163, 230, 53, 0.12)",
        },
      },
    },
  },

  plugins: [],
};
