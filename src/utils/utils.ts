import { getCollection } from "astro:content"

import type { collections } from "#content.config.ts"

export type CollectionNames = keyof typeof collections

/** A wrapper around Astro's {@link getCollection} that sorts the collection by date */
export const getSortedCollection = async (collection: CollectionNames) => {
  const posts = await getCollection(collection)
  return posts.toSorted((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}
