/** @type {import("prettier").Options} */
export default {
  printWidth: 120,
  semi: false,
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
}
