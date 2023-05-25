interface Options {
  srcDir: boolean;
  presetPath: string;
}
export const getTailwindConfig = ({ srcDir, presetPath }: Options) => {
  return `
/** @type {import('tailwindcss').Config} */
export default {
  presets: [require("${presetPath}")],
  darkMode: "class",
  content: [${
    srcDir
      ? `"./src/**/*.{js,jsx,ts,tsx}"`
      : `"./components/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}`
  }],
};
`.trim();
};

export const getTailwindPreset = () => {
  return `
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
  `.trim();
};
