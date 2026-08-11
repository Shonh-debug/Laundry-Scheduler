import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          "blue-dark": "#1D4ED8",
          "blue-light": "#EFF6FF",
          lime: "#D4F7A8",
          "lime-hover": "#C2F090",
          "lime-text": "#1E4A00",
          yellow: "#FEF9C3",
          "yellow-border": "#FEF08A",
          "yellow-accent": "#EAB308",
          background: "#F5F6FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        modal: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
