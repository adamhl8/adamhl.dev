import type { RemarkPlugin } from "@astrojs/markdown-remark"
import type { Root } from "mdast"
import type { VFile } from "vfile"

import { toString as mdastToString } from "mdast-util-to-string"
import getReadingTime from "reading-time"

const processReadingTime = (tree: Root, file: VFile) => {
  const textOnPage = mdastToString(tree)
  const readingTime = getReadingTime(textOnPage)
  // readingTime.text will give us minutes read as a friendly string,
  // i.e. "3 min read"
  file.data.astro ??= {}
  file.data.astro.frontmatter ??= {}
  file.data.astro.frontmatter["readingTime"] = readingTime.text
}

const remarkReadingTime: RemarkPlugin = () => processReadingTime

export { remarkReadingTime }
