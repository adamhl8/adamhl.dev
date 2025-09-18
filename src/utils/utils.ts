import { getCollection } from "astro:content"

import type { collections } from "~/content/config.ts"

export type CollectionNames = keyof typeof collections

/**
 * A wrapper around Astro's {@link getCollection} that sorts the collection by date
 *
 * @param collection One of {@link CollectionNames}
 * @returns The sorted collection
 */
async function getSortedCollection<T extends CollectionNames>(collection: T) {
  const posts = await getCollection(collection)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export { getSortedCollection }
