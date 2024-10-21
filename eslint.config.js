import pluginJs from "@eslint/js"
import biome from "eslint-config-biome"
import astro from "eslint-plugin-astro"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  pluginJs.configs.recommended,
  biome,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...astro.configs.all,
  ...astro.configs["jsx-a11y-strict"],
  {
    languageOptions: {
      parserOptions: {
        // https://github.com/ota-meshi/astro-eslint-parser/issues/331
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
  { ignores: ["**/*.js", "**/*.mjs", ".astro", "dist"] },
]
