import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  entry: ["scripts/*.ts"],
  ignoreDependencies: [
    "@astrojs/check",
    "@iconify-json/tabler",
    "jsonresume-theme-react-tailwind",
    "resumed",
    "@adamhl8/font-iosevka",
  ],
  ignoreUnresolved: ["~icons/.+"],
})

export default config
