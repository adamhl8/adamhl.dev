import type { APIRoute } from "astro"

import { SITEMAP_FILE } from "~/consts.ts"

const getRobotsTxt = (sitemapURL: URL) => `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = ({ site }) => new Response(getRobotsTxt(new URL(SITEMAP_FILE, site)))
