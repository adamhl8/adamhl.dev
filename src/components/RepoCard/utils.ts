import * as v from "valibot"

const RepoSchema = v.object({
  html_url: v.string(),
  name: v.string(),
  description: v.string(),
  language: v.string(),
  stargazers_count: v.number(),
  forks: v.number(),
})

async function getRepoData(repo: string) {
  // fallback to unauthenticated requests if GITHUB_ASTRO_TOKEN is not set so this works in CI
  const repoFetchOptions =
    typeof import.meta.env.GITHUB_ASTRO_TOKEN === "string"
      ? {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${import.meta.env.GITHUB_ASTRO_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      : {}

  const repoResp = await fetch(`https://api.github.com/repos/${repo}`, repoFetchOptions)
  if (!repoResp.ok)
    throw new Error(`Failed to fetch repo data for ${repo}: ${repoResp.status.toString()} ${repoResp.statusText}`)

  return v.parse(RepoSchema, await repoResp.json())
}

const LanguageColorsSchema = v.record(v.string(), v.object({ color: v.nullable(v.string()) }))
type LanguageColors = v.InferOutput<typeof LanguageColorsSchema>

let languageColors: LanguageColors | undefined

async function getLanguageColors() {
  if (languageColors) return languageColors

  const colorsResp = await fetch("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json")
  if (!colorsResp.ok)
    throw new Error(`Failed to fetch language colors: ${colorsResp.status.toString()} ${colorsResp.statusText}`)

  languageColors = v.parse(LanguageColorsSchema, await colorsResp.json())

  return languageColors
}

export { getRepoData, getLanguageColors }
