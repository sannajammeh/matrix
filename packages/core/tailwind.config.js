/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  theme: {
    extend: {
      container: {
        center: true,
      },
    },
  },
  plugins: [
    require("./radix-colors")({
      colors: ["blue", "slate", "gray"],
    }),
  ],
};
