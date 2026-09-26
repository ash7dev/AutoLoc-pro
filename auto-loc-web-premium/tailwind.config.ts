import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
        gloock: ["var(--font-gloock)", "Georgia", "serif"],
        body: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        cinzel: ["var(--font-cinzel)", "Georgia", "serif"],
        syne: ["var(--font-syne)", "sans-serif"],
      },

      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          dark: "#041912",
          main: "#0A3D2E",
          emerald: "#10b981",
          gold: "#F1DFB6",
        },
        forest: {
          50: "#F1F6EA",
          100: "#E4EBDB",
          200: "#A8D5C1",
          300: "#4DA788",
          400: "#22805D",
          500: "#14654C",
          600: "#0B3D2E",
          700: "#072A20",
          800: "#041912",
          900: "#020F0B",
          950: "#010806",
        },
        gold: {
          50: "#FBF6E9",
          100: "#F5EBCE",
          200: "#F1DFB6",
          300: "#E6CA8B",
          400: "#D4AF37",
          500: "#B89320",
        },
        champagne: {
          DEFAULT: "#F1DFB6",
          light: "#FBF6E9",
          dark: "#E6CA8B",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        cream: {
          50: "#F8FBF4",
          100: "#F1F6EA",
          200: "#E4EBDB",
          300: "#FBF6E9",
          400: "#F1DFB6",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        "glow-lg": "0 0 50px -10px rgba(16, 185, 129, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
