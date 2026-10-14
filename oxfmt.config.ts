import { oxfmtConfig } from "@adamhl8/configs"
import { defineConfig } from "oxfmt"

const config = oxfmtConfig({ astro: { allowShorthand: false } })

export default defineConfig(config)
