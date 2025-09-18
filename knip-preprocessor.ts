import type { Preprocessor, ReporterOptions } from "knip"
import type { Issue, SymbolIssueType } from "knip/dist/types/issues"

/**
 * Filters issues based on the provided filter function.
 *
 * This is needed because we also need to update `options.counters` after filtering issues.
 */
function filterIssues(
  options: ReporterOptions,
  issueType: SymbolIssueType,
  filter: (issueEntry: [string, Record<string, Issue>]) => boolean,
) {
  const issuesObject = options.issues[issueType]
  const filteredIssues = Object.fromEntries(Object.entries(issuesObject).filter(filter))

  const issueCount = Object.keys(issuesObject).length
  const filteredIssueCount = Object.keys(filteredIssues).length
  const issuesRemovedCount = issueCount - filteredIssueCount

  options.counters[issueType] = issueCount - issuesRemovedCount
  options.issues[issueType] = filteredIssues
}

const preprocess: Preprocessor = (options) => {
  filterIssues(options, "unlisted", ([key]) => !key.includes("prettier"))

  // filter out issues where the issue object is empty
  // filterIssue(options, "unlisted", ([, issueObj]) => Object.keys(issueObj).length > 0)

  console.log(`logging from 'knip-preprocessor.ts':\n${Bun.inspect(options.issues.unlisted)}`)

  return options
}

// biome-ignore lint/style/noDefaultExport: ignore
export default preprocess
