import { getCollection } from "astro:content";
import type { collections } from "./content/config.ts";

type ContentCollection = keyof typeof collections;

async function getSortedCollection<T extends ContentCollection>(collection: T) {
	const posts = await getCollection(collection);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export { getSortedCollection };
