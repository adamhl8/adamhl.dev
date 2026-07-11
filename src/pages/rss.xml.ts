import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { SITE_DESCRIPTION, SITE_TITLE } from "#consts.ts"

export const GET: APIRoute = async (context) => {
  const { site } = context
  if (!site) throw new Error("site is not set in the Astro config")

  const posts = await getCollection("blog")
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    stylesheet: "/rss/styles.xsl",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  })
}
