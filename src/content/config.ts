import { defineCollection, z } from "astro:content"

const blogCollection = defineCollection({
  type: "content",
  schema: {
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
  },
})

export const collections = {
  blog: blogCollection,
}
