/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shield: {
          900: "#030712",
          800: "#0a0f1e",
          700: "#0f1729",
          600: "#152040",
          500: "#1a2a52",
          accent: "#00f5ff",
          green: "#00ff88",
          red: "#ff2d55",
          orange: "#ff6b00",
          purple: "#7c3aed",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Orbitron'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "scan-line": "scanLine 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "matrix-rain": "matrixRain 10s linear infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glow: {
          "0%": { textShadow: "0 0 5px #00f5ff, 0 0 10px #00f5ff" },
          "100%": { textShadow: "0 0 20px #00f5ff, 0 0 40px #00f5ff, 0 0 80px #00f5ff" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px)",
        "hex-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L55 20v30L30 65 5 50V20z' fill='none' stroke='rgba(0,245,255,0.08)' stroke-width='1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
