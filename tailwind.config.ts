import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06040c",
        night: "#0c0919",
        panel: "#141026",
        violet: { DEFAULT: "#8b5cf6", deep: "#5b21b6" },
        electric: "#2f6bff",
        coral: "#ff5a3c",
        sun: "#ff9a1f",
        gold: { DEFAULT: "#ffc94a", deep: "#d99a12" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        pulseGlow: { "0%,100%": { boxShadow: "0 0 0 0 rgba(255,201,74,.55)" }, "50%": { boxShadow: "0 0 0 14px rgba(255,201,74,0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        popIn: { "0%": { opacity: "0", transform: "scale(.85)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(100%)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        flipIn: { "0%": { transform: "translateY(-40%)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        drift: { "0%": { transform: "translateY(0) translateX(0)", opacity: "0" }, "20%": { opacity: ".9" }, "100%": { transform: "translateY(-120px) translateX(20px)", opacity: "0" } },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-out infinite",
        shimmer: "shimmer 3s linear infinite",
        popIn: ".35s cubic-bezier(.2,.9,.3,1.3) both popIn",
        slideUp: ".35s ease-out both slideUp",
        spinSlow: "spinSlow 24s linear infinite",
        flipIn: ".35s ease-out both flipIn",
        drift: "drift 7s ease-in infinite",
      },
    },
  },
  plugins: [],
};
export default config;
