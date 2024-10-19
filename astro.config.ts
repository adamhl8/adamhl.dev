import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

import rehypeCallouts from "rehype-callouts";
import remarkBreaks from "remark-breaks";

// https://astro.build/config
export default defineConfig({
	site: "https://adamhl.dev",
	integrations: [mdx(), sitemap(), tailwind()],
	markdown: {
		remarkPlugins: [remarkBreaks],
		rehypePlugins: [rehypeCallouts],
	},
});
