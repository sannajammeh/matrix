/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  theme: {
    extend: {
      container: {
        center: true,
      },
    },
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeInUpScale: {
        from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
        to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
      },
    },
    animation: {
      fadeIn: "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      fadeInUpScale: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
  plugins: [
    require("./radix-colors")({
      colors: ["blue", "slate", "gray", "blackA"],
    }),
  ],
};
