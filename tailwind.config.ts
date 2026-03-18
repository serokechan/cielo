import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cielo: {
          bg: "#0b1020",
          panel: "#131a2f",
          border: "#24304f",
          accent: "#5eead4",
          text: "#e5eefc"
        }
      }
    },
  },
  plugins: [],
};

export default config;
