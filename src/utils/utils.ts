import { getCollection } from "astro:content"
import type { collections } from "../content/config.ts"

export type CollectionNames = keyof typeof collections

async function getSortedCollection<T extends CollectionNames>(collection: T) {
  const posts = await getCollection(collection)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

let languageColors: Record<string, { color: string }>

async function getLanguageColors() {
  if (languageColors) return languageColors
  const colorsResp = await fetch("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json")
  languageColors = await colorsResp.json()
  return languageColors
}

export { getSortedCollection, getLanguageColors }
