import type { AstroExpressiveCodeOptions } from "astro-expressive-code"

type ShikiConfig = Exclude<NonNullable<AstroExpressiveCodeOptions["shiki"]>, boolean>
type ShikiLang = NonNullable<ShikiConfig["langs"]>[number]

const response = await fetch(
  "https://raw.githubusercontent.com/caddyserver/vscode-caddyfile/refs/heads/master/syntaxes/caddyfile.tmLanguage.json",
)

// oxlint-disable-next-line typescript/no-unsafe-type-assertion - the URL serves a TextMate grammar, which is a valid `ShikiLang`
export const caddyfile = (await response.json()) as ShikiLang
