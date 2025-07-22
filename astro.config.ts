import mdx from "@astrojs/mdx"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"
import sectionize from "@hbsnow/rehype-sectionize"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"
import expressiveCode, { type AstroExpressiveCodeOptions } from "astro-expressive-code"
import icon from "astro-icon"
import robotsTxt from "astro-robots-txt"
import sitemap from "astro-sitemap"
import webmanifest, { type WebmanifestOptions } from "astro-webmanifest"
import remarkBreaks from "remark-breaks"

// biome-ignore lint/plugin/import-paths: astro doesn't resolve path aliases in the config
import { remarkReadingTime } from "./src/utils/remark-reading-time.ts"

const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  themes: ["github-dark", "github-light"],
  themeCssSelector: () => `[data-theme="light"]`,
  plugins: [pluginLineNumbers()],
  defaultProps: {
    wrap: true,
  },
  styleOverrides: {
    uiFontFamily: "var(--font-sans)",
    codeFontFamily: "var(--font-mono)",
  },
}

const webmanifestOptions: WebmanifestOptions = {
  name: "adamhl.dev",
  icon: "src/favicon.svg",
}

// biome-ignore lint/style/noDefaultExport: astro config
export default defineConfig({
  site: "https://adamhl.dev",
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    preserveScriptOrder: true,
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Atkinson Hyperlegible Next",
        cssVariable: "--font-atkinson-hyperlegible-next",
        weights: ["200 800"],
      },
      {
        provider: fontProviders.google(),
        name: "JetBrains Mono",
        cssVariable: "--font-jetbrains-mono",
        weights: ["100 800"],
      },
    ],
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
    rehypePlugins: [sectionize],
  },
})
