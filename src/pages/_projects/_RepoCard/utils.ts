import * as v from "valibot"

const RepoSchema = v.object({
  html_url: v.string(),
  name: v.string(),
  description: v.string(),
  language: v.string(),
  stargazers_count: v.number(),
  forks: v.number(),
})

/**
 * Fetches the repo data from the GitHub API
 *
 * @param repo The repo name: e.g. "adamhl8/my-repo"
 * @returns The repo data: {@link RepoSchema}
 */
export async function getRepoData(repo: string) {
  const repoResp = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${import.meta.env["GITHUB_TOKEN"]}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
  if (!repoResp.ok)
    throw new Error(`failed to fetch repo data for ${repo}: ${repoResp.status.toString()} ${repoResp.statusText}`)

  return v.parse(RepoSchema, await repoResp.json())
}

const LanguageColorsSchema = v.record(v.string(), v.object({ color: v.nullable(v.string()) }))
type LanguageColors = v.InferOutput<typeof LanguageColorsSchema>

let languageColorsPromise: Promise<LanguageColors> | undefined

/**
 * Fetches the language colors from: {@link https://raw.githubusercontent.com/ozh/github-colors/master/colors.json}
 *
 * @returns The language colors: {@link LanguageColors}
 */
export function getLanguageColors() {
  if (!languageColorsPromise) {
    const fetchLanguageColors = async () => {
      const colorsResp = await fetch("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json")
      if (!colorsResp.ok)
        throw new Error(`Failed to fetch language colors: ${colorsResp.status.toString()} ${colorsResp.statusText}`)
      return v.parse(LanguageColorsSchema, await colorsResp.json())
    }
    languageColorsPromise = fetchLanguageColors()
  }

  return languageColorsPromise
}
