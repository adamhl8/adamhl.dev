import { getCollection } from "astro:content";
import type { collections } from "./content/config.ts";

type Collection = keyof typeof collections;

async function getSortedCollection(collection: Collection) {
	const posts = await getCollection(collection);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export { getSortedCollection };
