import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzPluginData } from "./quartz/plugins/vfile.js"
import { SimpleSlug, isSimpleSlug } from "./quartz/util/path.js"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

const EXCLUDED_EXPLORER_NAMES = ["Wishlist"]

const recentBlogFilter = (f: QuartzPluginData) => {
  // only include pages in the blog folder
  return (f.slug?.startsWith("blog/") && f.slug !== "blog/index") ?? false
}

const defaultComponents = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.Darkmode(),
    Component.PageTitle(),
    Component.Search(),
    Component.RecentNotes({
      title: "Recent Blog Posts",
      linkToMore: "blog" as SimpleSlug,
      limit: 3,
      filter: recentBlogFilter,
    }),
    Component.Explorer({
      title: "Explorer",
      folderClickBehavior: "link",
      filterFn: (node) => !EXCLUDED_EXPLORER_NAMES.includes(node.name),
    }),
    Component.MobileOnly(Component.Spacer()),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents())],
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [...defaultComponents.beforeBody, Component.TagList()],
  left: [...defaultComponents.left],
  right: [...defaultComponents.right],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [...defaultComponents.beforeBody],
  left: [...defaultComponents.left],
  right: [...defaultComponents.right],
}
