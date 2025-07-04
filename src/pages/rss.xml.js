import { getCollection } from "astro:content"
import rss from "@astrojs/rss"

import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts.ts"

export async function GET(context) {
  const posts = await getCollection("blog")
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    stylesheet: "/rss/styles.xsl",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  })
}
