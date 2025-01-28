import mdx from "@astrojs/mdx"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"
import tailwindcss from "@tailwindcss/vite"
import expressiveCode, { type AstroExpressiveCodeOptions } from "astro-expressive-code"
import icon from "astro-icon"
import robotsTxt from "astro-robots-txt"
import sitemap from "astro-sitemap"
import webmanifest, { type WebmanifestOptions } from "astro-webmanifest"
import { defineConfig } from "astro/config"
import remarkBreaks from "remark-breaks"
import { remarkReadingTime } from "./src/utils/remark-reading-time.ts"

const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  themes: ["github-dark", "github-light"],
  themeCssSelector: () => {
    return `[data-theme="light"]`
  },
  plugins: [pluginLineNumbers()],
  defaultProps: {
    wrap: true,
  },
}

const webmanifestOptions: WebmanifestOptions = {
  name: "adamhl.dev",
  icon: "src/favicon.svg",
}

// https://astro.build/config
export default defineConfig({
  site: "https://adamhl.dev",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    expressiveCode(expressiveCodeOptions),
    mdx(),
    icon(),
    sitemap({ exclude: ["share/**"] }),
    robotsTxt(),
    webmanifest(webmanifestOptions),
  ],
  markdown: {
    remarkPlugins: [remarkBreaks, remarkReadingTime],
  },
})
