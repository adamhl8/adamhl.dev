import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import icon from "astro-icon"
import { defineConfig } from "astro/config"
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
    icon(),
  ],
  markdown: {
    remarkPlugins: [remarkBreaks, remarkReadingTime],
    rehypePlugins: [rehypeCallouts],
  },
})
