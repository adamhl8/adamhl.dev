import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
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
} as const)

export default config
