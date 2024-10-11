import type { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "adamhl.dev",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "adamhl.dev",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Atkinson Hyperlegible",
        body: "Source Sans Pro",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "hsl(0, 0%, 90%)",
          lightgray: "hsl(0, 0%, 75%)",
          gray: "hsl(0, 0%, 60%)",
          darkgray: "hsl(0, 0%, 25%)",
          dark: "hsl(0, 0%, 10%)",
          secondary: "hsl(150, 40%, 40%)", // 20% darker than darkMode
          tertiary: "hsl(180, 40%, 30%)", // 10% darker than darkMode
          highlight: "hsl(150, 40%, 40%, 0.15)",
          textHighlight: "hsl(150, 40%, 40%, 0.40)",
        },
        darkMode: {
          light: "hsl(0, 0%, 10%)",
          lightgray: "hsl(0, 0%, 25%)",
          gray: "hsl(0, 0%, 60%)",
          darkgray: "hsl(0, 0%, 75%)",
          dark: "hsl(0, 0%, 90%)",
          secondary: "hsl(150, 40%, 60%)",
          tertiary: "hsl(180, 40%, 40%)",
          highlight: "hsl(150, 40%, 60%, 0.15)",
          textHighlight: "hsl(150, 40%, 60%, 0.40)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: true,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.HardLineBreaks(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
