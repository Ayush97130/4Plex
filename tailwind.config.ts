import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#121315", panel: "#1B1C20", raised: "#25262B", bone: "#ECE8E1", mute: "#9A9AA3", ember: "#E9A23B" },
    fontFamily: { sans: ["var(--font-manrope, 'Manrope')", "system-ui", "sans-serif"] },
  } },
} satisfies Config;
