import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  overrides: [
    {
      // Turn off `import/unambiguous` because Astro always parses frontmatter and `<script>` blocks as modules.
      files: ["**/*.astro"],
      rules: {
        "import/unambiguous": "off",
      },
    },
  ],
})

export default defineConfig(config)
