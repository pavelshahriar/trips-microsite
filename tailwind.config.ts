import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#141c2e",
          900: "#1a2438",
          800: "#223047",
          700: "#2c3f5c",
          600: "#384f6e",
          500: "#476382",
        },
        gold: {
          DEFAULT: "#f0c040",
          light: "#f7d468",
          dark: "#c9960c",
        },
        crimson: {
          DEFAULT: "#e8403a",
          light: "#ff6b65",
          dark: "#b52d28",
        },
        pitch: {
          DEFAULT: "#2dbd6e",
          light: "#40d982",
          dark: "#1e9654",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
