import { knipConfig } from "@adamhl8/configs"

const config = knipConfig(
  {
    entry: ["scripts/*.ts"],
    ignoreDependencies: [
      "@astrojs/check",
      "@iconify-json/tabler",
      "jsonresume-theme-react-tailwind",
      "resumed",
      "@adamhl8/eslint-plugin-clean-modules",
      "@adamhl8/font-iosevka",
    ],
    ignoreUnresolved: ["~icons/.+"],
  },
  { arrays: "replace" },
)

export default config
