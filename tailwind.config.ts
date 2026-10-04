import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#3C4043",
        input: "#3C4043",
        ring: "#8AB4F8",
        background: "#202124",
        foreground: "#E8EAED",
        dark: {
          1: "#202124", // Google Meet main dark surface
          2: "#1A1B1E", // Layout background
          3: "#2D2E31", // Input & card surface
          4: "#3C4043", // Borders & subtle dividers
          5: "#5F6368", // Muted icon / outline
        },
        meet: {
          blue: "#1A73E8",
          blueLight: "#8AB4F8",
          blueHover: "#1557B0",
          red: "#EA4335",
          redHover: "#D93025",
          green: "#34A853",
          yellow: "#FBBC04",
          surface: "#202124",
          card: "#28292C",
          hover: "#303134",
          text: "#E8EAED",
          muted: "#9AA0A6",
        },
        // Maintain backwards compatibility for existing components
        blue: {
          1: "#1A73E8",
          DEFAULT: "#1A73E8",
        },
        sky: {
          1: "#BDC1C6",
          2: "#E8EAED",
          3: "#F1F3F4",
        },
        orange: {
          1: "#EA4335",
        },
        purple: {
          1: "#1A73E8",
        },
        yellow: {
          1: "#F29900",
        },
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
        xl: "12px",
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
