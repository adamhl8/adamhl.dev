import { toString as mdastToString } from "mdast-util-to-string"
import getReadingTime from "reading-time"

export function remarkReadingTime() {
  // biome-ignore lint/suspicious/noExplicitAny:
  return (tree: unknown, { data }: any) => {
    const textOnPage = mdastToString(tree)
    const readingTime = getReadingTime(textOnPage)
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    data.astro.frontmatter.readingTime = readingTime.text
  }
}
