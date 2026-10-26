import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  entry: ["scripts/*.ts"],
  ignoreDependencies: ["@adamhl8/font-iosevka", "jsonresume-theme-react-tailwind", "resumed"],
})

export default config
