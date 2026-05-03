import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#052a42",
        secondary: "#df9a13",
      },
      fontFamily: {
        sans: ["var(--font-en-inter)", "var(--font-en-manrope)", "sans-serif"],
        arabic: ["var(--font-ar-cairo)", "var(--font-ar-plex)", "sans-serif"],
      },
    },
  },
  plugins: [
    typography,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".px-inline-4": {
          paddingInline: "1rem",
        },
        ".mx-inline-auto": {
          marginInline: "auto",
        },
        ".text-start": {
          textAlign: "start",
        },
        ".text-end": {
          textAlign: "end",
        },
      });
    }),
  ],
};

export default config;