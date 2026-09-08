/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: "#05070c",
          panel: "#07090e",
          border: "#1e293b",
          cyan: "#06b6d4",
          magenta: "#ec4899",
          green: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};