import { getCollection } from "astro:content"
import type { collections } from "../content/config.ts"

export type CollectionNames = keyof typeof collections

async function getSortedCollection<T extends CollectionNames>(collection: T) {
  const posts = await getCollection(collection)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export { getSortedCollection }
