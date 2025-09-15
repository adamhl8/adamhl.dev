import "astro/astro-jsx"

// https://ota-meshi.github.io/eslint-plugin-astro/user-guide/#resolving-error-in-jsx-unsafe-return-of-an-any-typed-value
declare global {
  // biome-ignore lint/style/noNamespace: ignore
  namespace JSX {
    type Element = HTMLElement
  }
}
