import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),

	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
	}),
});

const til = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/til" }),

	schema: z.object({
		title: z.string(),
		description: z.string().default(""),
		date: z.coerce.date(),
	}),
});

export const collections = { blog, til };
