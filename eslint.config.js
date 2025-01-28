import pluginJs from "@eslint/js"
import biome from "eslint-config-biome"
import astro from "eslint-plugin-astro"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["**/*.js", "**/*.mjs", ".astro", "dist"] },
  pluginJs.configs.recommended,
  biome,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  astro.configs["flat/all"],
  astro.configs["flat/jsx-a11y-strict"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        // would prefer to use projectService here, but can't: https://github.com/ota-meshi/astro-eslint-parser/issues/331
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },
  },
  {
    rules: {
      "astro/semi": "off",
      "astro/sort-attributes": "off",
    },
  },
  {
    files: ["src/components/Callout.astro"],
    rules: {
      "astro/no-set-html-directive": "off",
    },
  },
)
