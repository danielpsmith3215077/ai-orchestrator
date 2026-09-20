/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#1a3d44",
        slateglow: "#f5f0ed",
        "m98-bg": "#255059",
        "m98-bg-deep": "#1a3d44",
        "m98-bg-elevated": "#2d6469",
        "m98-cyan": "#078c8c",
        "m98-coral": "#f27b50",
        "m98-peach": "#f2ad94",
        "m98-taupe": "#a6786d",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Space Grotesk",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px rgba(7, 140, 140, 0.35)",
        "glow-teal": "0 0 40px rgba(242, 123, 80, 0.28)",
      },
      animation: {
        "float-slow": "float-slow 12s ease-in-out infinite",
        "glow-orb": "glow-orb 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "glow-orb": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.95", transform: "scale(1.08)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
