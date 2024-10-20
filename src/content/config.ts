import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
})

const optionalDescription = baseSchema.extend({
  description: z.string().optional(),
})

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: baseSchema,
})

const til = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/til" }),
  schema: optionalDescription,
})

const share = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/share" }),
  schema: optionalDescription,
})

export const collections = { blog, til, share }
