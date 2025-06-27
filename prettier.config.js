import prettierConfig from "@adamhl8/configs/prettier"

/** @type {import("prettier").Config} */
// biome-ignore lint/style/noDefaultExport: prettier config
export default {
  ...prettierConfig,
  tailwindAttributes: ["titleClass"],
}
