import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#121414", gold: "#EFE8A8", card: "#1b1e1e", line: "#2d3131", mute: "#a0a398" },
    fontFamily: { serif: ["var(--font-serif)", "Georgia", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    keyframes: { drift: { "0%,100%": { left: "4%", top: "8%" }, "25%": { left: "55%", top: "20%" }, "50%": { left: "30%", top: "75%" }, "75%": { left: "60%", top: "60%" } } },
    animation: { drift: "drift 14s linear infinite" },
  } },
  plugins: [],
};
export default config;
