import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  overrides: [
    {
      files: ["**/*.astro"],
      rules: {
        "import/unambiguous": "off",
      },
    },
  ],
})

export default defineConfig(config)
