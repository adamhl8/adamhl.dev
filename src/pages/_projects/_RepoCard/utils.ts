import { nullable, number, object, parse, record, string } from "valibot"
import type { InferOutput } from "valibot"

const RepoSchema = object({
  html_url: string(),
  name: string(),
  description: string(),
  language: string(),
  stargazers_count: number(),
  forks: number(),
})

/** Fetches the repo data from the GitHub API for a repo name like "adamhl8/my-repo" */
export const getRepoData = async (repo: string) => {
  const repoResp = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${import.meta.env["GITHUB_TOKEN"]}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
  if (!repoResp.ok)
    throw new Error(`failed to fetch repo data for ${repo}: ${repoResp.status.toString()} ${repoResp.statusText}`)

  return parse(RepoSchema, await repoResp.json())
}

const ColorSchema = object({ color: nullable(string()) })
const LanguageColorsSchema = record(string(), ColorSchema)
type LanguageColors = InferOutput<typeof LanguageColorsSchema>

let languageColorsPromise: Promise<LanguageColors> | undefined

/** Fetches the language colors from {@link https://raw.githubusercontent.com/ozh/github-colors/master/colors.json} */
export const getLanguageColors = async () => {
  if (!languageColorsPromise) {
    const fetchLanguageColors = async () => {
      const colorsResp = await fetch("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json")
      if (!colorsResp.ok)
        throw new Error(`Failed to fetch language colors: ${colorsResp.status.toString()} ${colorsResp.statusText}`)
      return parse(LanguageColorsSchema, await colorsResp.json())
    }
    languageColorsPromise = fetchLanguageColors()
  }

  return languageColorsPromise
}
