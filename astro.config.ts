import mdx from "@astrojs/mdx"
import { defineConfig } from "astro/config"

import sitemap from "@astrojs/sitemap"

import tailwind from "@astrojs/tailwind"

import rehypeCallouts from "rehype-callouts"
import remarkBreaks from "remark-breaks"
import { remarkReadingTime } from "./src/utils/remark-reading-time.ts"

// https://astro.build/config
export default defineConfig({
  site: "https://adamhl.dev",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/share/"),
    }),
    tailwind(),
  ],
  markdown: {
    remarkPlugins: [remarkBreaks, remarkReadingTime],
    rehypePlugins: [rehypeCallouts],
  },
})
