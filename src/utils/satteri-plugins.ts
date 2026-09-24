import getReadingTime from "reading-time"
import type { MdastContent, MdastNode, MdastVisitorContext } from "satteri"
import { defineHastPlugin, defineMdastPlugin } from "satteri"

// Returns a factory so satteri creates a new `blocks` array for each document.
export const readingTimePlugin = () => {
  // Collect text per block because `ctx.textContent(root)` joins blocks with no separator, which merges words.
  const blocks: string[] = []
  const collectText = (node: Readonly<MdastNode>, ctx: MdastVisitorContext) => {
    blocks.push(ctx.textContent(node))
  }

  return defineMdastPlugin({
    name: "reading-time",
    paragraph: collectText,
    heading: collectText,
    tableCell: collectText,
    code(node) {
      blocks.push(node.value)
    },
    after(_root, ctx) {
      const { astro } = ctx.data
      if (!astro || blocks.length === 0) return
      astro.frontmatter["readingTime"] = getReadingTime(blocks.join("\n")).text
    },
  })
}

export const breaksPlugin = defineMdastPlugin({
  name: "breaks",
  text(node, ctx) {
    if (!node.value.includes("\n")) return

    const [first = "", ...rest] = node.value.split(/\r?\n/v)

    const nodes: MdastContent[] = [
      { type: "text", value: first },
      ...rest.flatMap((value): MdastContent[] =>
        value === "" ? [{ type: "break" }] : [{ type: "break" }, { type: "text", value }],
      ),
    ]
    ctx.replaceNode(node, nodes)
  },
})

export const externalLinksPlugin = defineHastPlugin({
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const isExternal = /^https?:\/\//v.test(node.properties.href ?? "")
      if (!isExternal) return

      ctx.setProperty(node, "target", "_blank")
      ctx.setProperty(node, "rel", ["noopener", "noreferrer"])
    },
  },
})
