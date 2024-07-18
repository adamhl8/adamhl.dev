import typography from "@tailwindcss/typography"
import daisyui from "daisyui"
import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: ["emerald"],
  },
} satisfies Config
