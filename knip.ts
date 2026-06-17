import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  ignoreDependencies: ["@iconify-json/tabler", "jsonresume-theme-react-tailwind", "mdast", "vfile", "sharp"],
  ignoreUnresolved: ["~icons/.+"],
} as const)

export default config
