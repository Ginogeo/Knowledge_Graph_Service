import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: { ink: "#0b1117", "ink-soft": "#111b24", coral: "#f28b62", mint: "#8ce3bd", mist: "#dce7e8" },
			fontFamily: { display: ["Space Grotesk", "sans-serif"], body: ["DM Sans", "sans-serif"] },
			boxShadow: { glow: "0 0 28px rgba(242, 139, 98, .22)" },
			backgroundImage: { grid: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)" }
		}
	},
	plugins: []
};
export default config;
