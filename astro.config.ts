import { satteri } from "@astrojs/markdown-satteri"
import mdx from "@astrojs/mdx"
import node from "@astrojs/node"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"
import tailwindcss from "@tailwindcss/vite"
import type { AstroExpressiveCodeOptions } from "astro-expressive-code"
import expressiveCode from "astro-expressive-code"
import { defineConfig, fontProviders } from "astro/config"
import icons from "unplugin-icons/vite"

import { breaksPlugin, externalLinksPlugin, readingTimePlugin } from "#/utils/satteri-plugins.ts"
import { caddyfile } from "#/utils/shiki-langs.ts"

const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  themes: ["github-dark", "github-light"],
  themeCssSelector: () => `[data-theme="light"]`,
  plugins: [pluginLineNumbers()],
  styleOverrides: {
    uiFontFamily: "var(--font-sans)",
    codeFontFamily: "var(--font-mono)",
  },
  shiki: {
    langs: [caddyfile],
  },
}

export default defineConfig({
  site: "https://adamhl.dev",
  output: "static",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss(), icons({ compiler: "astro" })],
  },
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    expressiveCode(expressiveCodeOptions),
    mdx(),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/share"),
    }),
    react(),
  ],
  markdown: {
    processor: satteri({
      features: {
        smartPunctuation: {
          dashes: true,
          ellipses: false,
          quotes: false,
        },
      },
      mdastPlugins: [readingTimePlugin, breaksPlugin],
      hastPlugins: [externalLinksPlugin],
    }),
  },
  prefetch: { prefetchAll: true },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Atkinson Hyperlegible Next",
      cssVariable: "--font-atkinson-hyperlegible-next",
      weights: ["200 800"],
    },
    {
      provider: fontProviders.local(),
      name: "Iosevka",
      cssVariable: "--font-iosevka",
      options: {
        variants: [
          {
            src: ["./src/fonts/Iosevka-Regular.ttf"],
            style: "normal",
            weight: "400",
          },
          {
            src: ["./src/fonts/Iosevka-Bold.ttf"],
            style: "normal",
            weight: "700",
          },
          {
            src: ["./src/fonts/Iosevka-Italic.ttf"],
            style: "italic",
            weight: "400",
          },
          {
            src: ["./src/fonts/Iosevka-BoldItalic.ttf"],
            style: "italic",
            weight: "700",
          },
        ],
      },
    },
  ],
})
