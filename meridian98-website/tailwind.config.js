/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0f172a",
        slateglow: "#f8fafc",
        "m98-bg": "#f8fafc",
        "m98-bg-deep": "#0f172a",
        "m98-bg-elevated": "#ffffff",
        "m98-cyan": "#1e40af",
        "m98-coral": "#f59e0b",
        "m98-peach": "#2563eb",
        "m98-taupe": "#cbd5e1",
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
        glow: "0 0 40px rgba(30, 64, 175, 0.2)",
        "glow-teal": "0 0 40px rgba(245, 158, 11, 0.22)",
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
