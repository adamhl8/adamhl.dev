import type { KnipConfig } from "knip"

const config = {
  entry: ["knip-preprocessor.ts"],
  project: ["**"],
  ignoreDependencies: [
    "@iconify-json/tabler",
    "@tailwindcss/typography",
    "daisyui",
    "tailwindcss",
    "jsonresume-theme-react-tailwind",
    "@astrojs/markdown-remark",
    "mdast",
    "vfile",
  ],
} satisfies KnipConfig

export default config
