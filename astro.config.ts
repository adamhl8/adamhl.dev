import mdx from "@astrojs/mdx"
import node from "@astrojs/node"
import sitemap from "@astrojs/sitemap"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"
import sectionize from "@hbsnow/rehype-sectionize"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"
import expressiveCode, { type AstroExpressiveCodeOptions } from "astro-expressive-code"
import remarkBreaks from "remark-breaks"
import Icons from "unplugin-icons/vite"

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

export default defineConfig({
  site: "https://adamhl.dev",
  output: "static",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss(), Icons({ compiler: "astro" })],
  },
  adapter: node({
    mode: "standalone",
  }),
  experimental: {
    preserveScriptOrder: true,
    staticImportMetaEnv: true,
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Atkinson Hyperlegible Next",
        cssVariable: "--font-atkinson-hyperlegible-next",
        weights: ["200 800"],
      },
      {
        provider: "local",
        name: "Iosevka",
        cssVariable: "--font-iosevka",
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
    ],
  },
  integrations: [
    expressiveCode(expressiveCodeOptions),
    mdx(),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/share"),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkBreaks, remarkReadingTime],
    rehypePlugins: [sectionize],
  },
})
