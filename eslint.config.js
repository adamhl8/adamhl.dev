import { ESLintConfigBuilder } from "@adamhl8/ts-project-configs"
import tseslint from "typescript-eslint"

const eslintConfig = new ESLintConfigBuilder().astro().build()

export default tseslint.config(
  { ignores: [".astro", "dist", "src/pages/rss.xml.js"] },
  eslintConfig,
  {
    languageOptions: {
      parserOptions: {
        // would prefer to use projectService here, but can't: https://github.com/ota-meshi/astro-eslint-parser/issues/331
        projectService: false,
        project: true,
      },
    },
  },
  {
    files: ["src/components/Callout.astro"],
    rules: {
      "astro/no-set-html-directive": "off",
    },
  },
  {
    files: [String.raw`src/**/\[...slug\].astro`],
    rules: {
      "jsdoc/require-jsdoc": "off",
    },
  },
)
