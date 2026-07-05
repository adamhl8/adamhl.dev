import getReadingTime from "reading-time"
import type { MdastContent, MdastNode, MdastVisitorContext } from "satteri"
import { defineHastPlugin, defineMdastPlugin } from "satteri"

const asString = (value: unknown) => (typeof value === "string" ? value : "")

const writeReadingTime = (ctx: MdastVisitorContext) => {
  const { astro } = ctx.data
  if (!astro) return
  const readingTimeProse = asString(ctx.data["readingTimeProse"])
  const readingTimeCode = asString(ctx.data["readingTimeCode"])
  const readableText = `${readingTimeProse}${readingTimeCode}`
  astro.frontmatter["readingTime"] = getReadingTime(readableText).text
}

export const readingTimePlugin = defineMdastPlugin({
  name: "reading-time",
  text(node, ctx) {
    // if `readingTimeProse` is already set, then we already have the text content of the root node
    if (typeof ctx.data["readingTimeProse"] === "string") return

    let root: Readonly<MdastNode> = node
    let parent: Readonly<MdastNode> | undefined = ctx.parent(node)
    while (parent) {
      root = parent
      parent = ctx.parent(root)
    }

    ctx.data["readingTimeProse"] = ctx.textContent(root)
    writeReadingTime(ctx)
  },
  code(node, ctx) {
    const existing = asString(ctx.data["readingTimeCode"])
    ctx.data["readingTimeCode"] = `${existing}${node.value}`
    writeReadingTime(ctx)
  },
})

export const breaksPlugin = defineMdastPlugin({
  name: "breaks",
  text(node, ctx) {
    if (!node.value.includes("\n")) return

    const [first = "", ...rest] = node.value.split(/\r?\n/v)

    const nodes: MdastContent[] = rest.flatMap((value) =>
      value === "" ? [{ type: "break" }] : [{ type: "break" }, { type: "text", value }],
    )
    ctx.insertAfter(node, nodes)
    ctx.replaceNode(node, { type: "text", value: first })
  },
})

export const externalLinksPlugin = defineHastPlugin({
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const { href } = node.properties
      const isExternal = typeof href === "string" && /^https?:\/\//v.test(href)
      if (!isExternal) return

      ctx.setProperty(node, "target", "_blank")
      ctx.setProperty(node, "rel", ["noopener", "noreferrer"])
    },
  },
})
