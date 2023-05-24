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
    require("./plugin-radix-colors")({
      colors: ["blue", "slate", "gray"],
    }),
  ],
};
