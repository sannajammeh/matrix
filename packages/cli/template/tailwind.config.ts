interface Options {
  srcDir: boolean;
}
export const getTailwindConfig = ({ srcDir }: Options) => {
  return `
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [${
    srcDir
      ? `"./src/**/*.{js,jsx,ts,tsx}"`
      : `"./components/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}`
  }],
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
`.trim();
};
