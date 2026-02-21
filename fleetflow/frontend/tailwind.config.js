/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: { DEFAULT: "#F97316", light: "#FB923C", dark: "#EA580C" },
        surface: { DEFAULT: "#0F1117", card: "#161B27", border: "#1E2738", hover: "#1A2235" },
        text: { primary: "#F0F4FF", secondary: "#8B99B5", muted: "#4A5568" },
      },
    },
  },
  plugins: [],
};
