---
title: "Which npm package has the largest version number?"
description: "I spent way too much time on this"
date: 2025-09-14
tags: [npm, typescript, javascript]
---

I was recently working on a project that uses the [AWS SDK for JavaScript](https://github.com/aws/aws-sdk-js-v3). When updating the dependencies in said project, I noticed that the version of that dependency was `v3.888.0`. Eight hundred eighty eight. That's a big number as far as versions go.

That got me thinking. I wonder what package in the [npm registry](https://www.npmjs.com) has the largest number in its version. Could be a major, minor, or patch version, and it doesn't have to be the latest version of the package. In other words, out of the three numbers in `<major>.<minor>.<patch>` for each version for each package, what is the largest number I can find?

**TL;DR? [Jump to the results](#results)** to see the answer.

## The npm API

Obviously npm has some kind of API, so it shouldn't be too hard to get a list of all... [3,639,812 packages](https://www.npmjs.com/#:~:text=Packages-,3%2C639%2C812,-Downloads%20%C2%B7%20Last). Oh. That's a lot of packages. Well, considering npm had 374 _billion_ package downloads in the past _month_, I'm sure they wouldn't mine me making a few million HTTP requests.

Doing a quick search search for "npm api" leads me to a readme in the [npm/registry repo](https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md) on GitHub. There's a `/-/all` endpoint listed in the table of contents which seems promising. That section doesn't actually exist in the readme but maybe it still works?

```sh
$ curl 'https://registry.npmjs.org/-/all'
{"code":"ResourceNotFound","message":"/-/all does not exist"}
```

Whelp, maybe npm packages have an ID and I can just start at 1 and count up? It looks like packages have an `_id` field... never mind, the `_id` field is the package _name_. Okay let's try to find something else.

A little more digging brings me to this [GitHub discussion](https://github.com/orgs/community/discussions/152515) about the npm replication API. So npm replicates package info in CouchDB at `https://replicate.npmjs.com`, and conveniently they support the [`_all_docs` endpoint](https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-all-docs). Let's give that a try:

```sh
$ curl 'https://replicate.npmjs.com/registry/_all_docs'
{
   "total_rows" : 3628088,
   "offset" : 0,
   "rows" : [
      {
         "id" : "-",
         "key" : "-",
         "value" : {
            "rev" : "5-f0890cdc1175072e37c43859f9d28403"
         }
      },
      {
         "id" : "--------------------------------------------------------------------------------------------------------------------------------whynunu",
         "key" : "--------------------------------------------------------------------------------------------------------------------------------whynunu",
         "value" : {
            "rev" : "1-1d26131b0f8f9702c444e061278d24f2"
         }
      },
      {
         "id" : "-----hsad-----",
         "key" : "-----hsad-----",
         "value" : {
            "rev" : "1-47778a3a6f9d8ce1e0530611c78c4ab4"
         }
      },
      # 997 more packages...
```

Those are some interesting package names. Looks like this data is paginated and by default I get 1,000 packages at a time. When I write the final script, I can set the `limit` query parameter to the max of 10,000 to make pagination a little less painful.

Fortunately the CouchDB docs have a [guide for pagination](https://docs.couchdb.org/en/latest/ddocs/views/pagination.html#paging), and it looks like it's as simple as using the `skip` query parameter.

```sh
$ curl 'https://replicate.npmjs.com/registry/_all_docs?skip=1000'
"Bad Request"
```

Never mind, according to the GitHub discussion linked above, `skip` is no longer supported. The "Paging (Alternate Method)" section of the same page says that I can use `startkey_docid` instead. If I grab the `id` of the last row, I should be able to use that to return the next set of rows. Fun fact, the 1000th package (alphabetically) on npm is `03-webpack-number-test`.

```sh
$ curl 'https://replicate.npmjs.com/registry/_all_docs?startkey_docid="03-webpack-number-test"'
{
    "total_rows" : 3628102,
    "offset" : 999,
    "rows" : [
    # another 1000 packages...
```

Nice. Also, another `3628102 - 3628088 = 14` packages have been published in the ~15 minutes since I ran the last query.

There's one more piece of the puzzle to figure out. How do I get all the versions for a given package? Unfortunately, it doesn't seem like I can get package version information along with the base info returned by `_all_docs`. I have to _separately_ fetch each package's metadata from `https://registry.npmjs.org/<package_id>`. Let's see what good ol' trusty `03-webpack-number-test` looks like:

```sh
$ curl 'https://registry.npmjs.org/03-webpack-number-test'
{
    # i've omitted some fields here
    "_id" : "03-webpack-number-test",
    "versions" : {
      "1.0.0" : { ... },
      # the rest of the versions...
```

Alright, I have everything I need. Now I just need to write a bash script that—just kidding. A wise programmer once said "if your shell script is more than 10 lines, it shouldn't be a shell script" (that was me, I said that). I like TypeScript, so let's use that.

The biggest bottleneck is going to be waiting on the `GET`s for each package's metadata. My plan is this:

- Grab all the package IDs from the replication API and save that data to a file (I don't want to have to refetch everything if the something goes wrong later in the script)
- Fetch package data in batches so we're not just doing 1 HTTP request at a time
- Save the package data to a file (again, hopefully I only have to fetch everything once)

Once I have all the package data, I can answer the original question of "largest number in version" and look at a few other interesting things.

(A couple hours and many iterations later...)

```sh
$ bun npm-package-versions.ts
Fetching package IDs...
Fetched 10000 packages IDs starting from offset 0
# this goes on for a while...
Finished fetching package IDs
Fetched 50 packages in 884ms (57 packages/s)
Fetched 50 packages in 852ms (59 packages/s)
# this goes on for a really long while...
```

See the [script section](#script) at the end to if you want to see what it looks like.

## Results

Some stats:

- Time to fetch all ~3.6 million package _IDs_: **A few minutes**
- Time to fetch version data for each one of those packages: **~12 hours** (yikes)
- Packages fetched per second: **~84 packages/s**
- Size of `package-ids.json`: **~78MB**
- Size of `package-data.json`: **~886MB**

**And the winner is...** (not really) [latentflip-test](https://www.npmjs.com/package/latentflip-test?activeTab=versions) at version `1000000000000000000.1000000000000000000.1000000000000000000`. And no, there haven't actually been one quintillion major versions of this package published. Disappointing, I know.

Well, I feel like that shouldn't count. I think we can do better and find a "real" package that actually follows semantic versioning. I think a better question to ask is this:

**For packages that _follow semantic versioning_, which package has the _largest number_ from `<major>.<minor>.<patch>` in _any_ of its versions?**

So, what does it mean to "follow semantic versioning"? Should we "disqualify" a package for skipping a version number? In this case, I think we'll just say that a package has to have more versions published than the largest number we find for that package. For example, a package with a version of `1.888.0` will have had _at least_ 888 versions published if it actually followed semver.

Before we get to the real winner, here are the top 10 packages _by total number of versions published_:

```
electron-remote-control -> 37328 total versions
@npm-torg/public-scoped-free-org-test-package-2 -> 37134 total versions
public-unscoped-test-package -> 27719 total versions
carrot-scan -> 27708 total versions
@npm-torg/public-test-package-2 -> 27406 total versions
@octopusdeploy/design-system-components -> 26724 total versions
@octopusdeploy/type-utils -> 26708 total versions
@octopusdeploy/design-system-tokens -> 22122 total versions
@mahdiarjangi/phetch-cli -> 19498 total versions
@atlassian-test-prod/hello-world -> 19120 total versions
```

Top 10 packages that (probably) follow semver _by largest number in one of its versions_:

```
electron-remote-control -> 19065 (1.2.19065)
@atlassian-test-prod/hello-world -> 16707 (9.7.16707)
@octopusdeploy/design-system-components -> 14274 (2025.3.14274)
@octopusdeploy/type-utils -> 14274 (2025.3.14274)
@octopusdeploy/design-system-tokens -> 14274 (2025.3.14274)
@atlassian-test-staging/test -> 13214 (49.4.13214)
binky -> 9906 (3.4.9906)
kse-visilia -> 5997 (1.6.5997)
@idxdb/promised -> 4614 (2.3.4614)
wix-style-react -> 4264 (1.1.4264)
```

So it seems like the winner is [electron-remote-control](https://github.com/DinoscapeProgramming/Remote-Control), right? Unfortunately, I'm not going to count that either. It only has so many versions because of a [misconfigured GitHub action](https://github.com/DinoscapeProgramming/Remote-Control/issues/3) that ran every hour... for a while.

I manually went down the above list, disqualifying any packages that had similar issues. I also checked that "new" versions actually differed from previous versions in terms of content. Overall, I looked for a package that was actually publishing new versions on purpose with _some_ kind of change to the package content.

**The real winner (#20 on the list) is:** [@wppconnect/wa-version](https://github.com/wppconnect-team/wa-version) at version `1.5.2219`.

What you do with this extremely important and useful information is up to you.

## Script

```ts
/* This script uses Bun specific APIs and should be executed directly with Bun */

import fs from "node:fs/promises"
import process from "node:process"

async function main() {
  const NUM_TO_PRINT = 20

  const packageIds = await fetchPackageIds()
  const packageData = await fetchAllPackageData(packageIds)
  const normalizedPackageData = normalizePackageData(packageData)

  const packagsByNumOfVersions = packageData.toSorted((a, b) => b.versions.length - a.versions.length) // don't use normalizedPackageData here because it *only* includes valid semver versions
  const packagesByLargestNumber = normalizedPackageData.toSorted((a, b) => b.largestNumber.num - a.largestNumber.num)

  // Ignore packages where the number of versions isn't greater than the largest number.
  // For example, a package with a version of 1.888.0 will have had *at least* 888 versions published if it actually followed semver.
  const packagesWithSemverByLargestNumber = packagesByLargestNumber.filter(
    (pkg) => pkg.versions.length >= pkg.largestNumber.num,
  )
  const packagesWithoutKnownBadByLargestNumber = packagesWithSemverByLargestNumber.filter((pkg) =>
    KNOWN_BAD_PACKAGES.every((badId) => !pkg.id.startsWith(badId)),
  )

  console.log(`\nTop ${NUM_TO_PRINT} packages by total number of versions published:`)
  for (const { id, versions } of packagsByNumOfVersions.slice(0, NUM_TO_PRINT)) {
    console.log(`${id} -> ${versions.length} total versions`)
  }

  const logPackagesByLargestNumber = (packages: NormalizedPackageData[]) => {
    for (const { id, largestNumber } of packages.slice(0, NUM_TO_PRINT)) {
      console.log(`${id} -> ${largestNumber.num} (${largestNumber.version})`)
    }
  }

  console.log(`\nTop ${NUM_TO_PRINT} packages by largest number in version:`)
  logPackagesByLargestNumber(packagesByLargestNumber)

  console.log(`\nTop ${NUM_TO_PRINT} packages that follow semver by largest number in version:`)
  logPackagesByLargestNumber(packagesWithSemverByLargestNumber)

  console.log(
    `\nTop ${NUM_TO_PRINT} packages that follow semver by largest number in version (excluding known bad packages):`,
  )
  logPackagesByLargestNumber(packagesWithoutKnownBadByLargestNumber)

  console.log("\nDone!")
}

/**
 * These are packages that have a large number of versions because of some automation (e.g. GitHub Action), where each "new" version was identical to the last.
 * For example, 'electron-remote-control' was publishing a version every hour for a long time due to a configuration mistake.
 */
const KNOWN_BAD_PACKAGES = [
  "electron-remote-control",
  "carrot-scan",
  "@atlassian-test",
  "@octopusdeploy",
  "binky",
  "kse-visilia",
  "intraactive-sdk-ui",
  "@idxdb/promised",
  "wix-style-react",
  "sale-client",
  "botfather",
  "electron-i18n",
  "warframe-items",
  "ebt-vue",
  "@geometryzen/jsxgraph",
  "eslint-config-innovorder-v2",
  "@innovorder/serverless-resize-bucket-images",
  "@xuda.io/xuda-worker-bundle",
  "@abtasty/pulsar-common-ui",
]

/**
 * Fetches every single package ID from the npm replicate API and writes the data to a file.
 */
async function fetchPackageIds(): Promise<string[]> {
  const packageIdsFile = Bun.file("package-ids.json")
  // return the existing package IDs if they exist
  if (await packageIdsFile.exists()) {
    console.log("Using existing package IDs")
    return (await packageIdsFile.json()) as string[]
  }

  console.log("Fetching package IDs...")
  let firstFetch = true
  let startKeyPackageId: string | undefined
  const packageIds: string[] = []

  // We use the last package ID of current fetch as the start key for the next fetch. Once the start key is the same as the last package ID, we've fetched all packages and can break out of the loop.
  while (true) {
    const LIMIT = 10_000
    const startKeyQueryParam = firstFetch ? "" : `&startkey_docid="${startKeyPackageId}"`
    const json = await fetchJson<{ rows: { id: string }[]; offset: number }>(
      `https://replicate.npmjs.com/registry/_all_docs?limit=${LIMIT}${startKeyQueryParam}`,
    )
    if (!json) process.exit(1) // Stop the script if we fail to fetch package IDs. The error will have already been logged.

    const { rows, offset } = json
    console.log(`Fetched ${rows.length} package IDs starting from offset ${offset}`)

    for (const { id: packageId } of rows) {
      if (startKeyPackageId === packageId) continue // Skip the startKeyPackageId. The startKeyPackageId is already in the list because it's the same as the last package ID from the previous fetch
      packageIds.push(packageId)
    }

    const lastPackageId = rows.at(-1)?.id
    if (startKeyPackageId === lastPackageId) break // we've reached the end of the package IDs

    startKeyPackageId = lastPackageId

    firstFetch &&= false
  }

  console.log("Finished fetching package IDs")
  console.log(`Writing package IDs to '${packageIdsFile.name}'...`)
  await packageIdsFile.write(JSON.stringify(packageIds))
  console.log(`Finished writing package IDs to '${packageIdsFile.name}'`)

  return packageIds
}

interface PackageData {
  id: string
  versions: string[]
}

/**
 * Fetches all package metadata from the npm registry API and writes the data to a file.
 */
async function fetchAllPackageData(packageIds: string[]): Promise<PackageData[]> {
  /** The number of packages to fetch at once */
  const BATCH_SIZE = 50

  interface FetchedPackageData {
    _id: string
    versions?: Record<string, unknown> // when we fetch package data, sometimes the versions object is missing
  }

  const packageDataFile = Bun.file("package-data.json")
  // return the existing package data if it exists
  if (await packageDataFile.exists()) {
    console.log("Using existing package data")
    return (await packageDataFile.json()) as PackageData[]
  }

  console.log("Fetching package data...")
  const allPackageData: PackageData[] = []

  while (packageIds.length > 0) {
    const startTime = Date.now()

    const batch = packageIds.splice(0, BATCH_SIZE)

    const packageDataPromises = batch.map(async (packageId) => {
      const fetchedPackageData = await fetchJson<FetchedPackageData>(
        `https://registry.npmjs.org/${encodeURIComponent(packageId)}`,
      )
      if (!fetchedPackageData) return
      const { _id, versions = {} } = fetchedPackageData // default versions to an empty object if it doesn't exist
      const packageData: PackageData = { id: _id, versions: Object.keys(versions).reverse() } // reverse the versions array so the newest version is first
      return packageData
    })
    const packageData = (await Promise.all(packageDataPromises)).filter((data) => data !== undefined)

    allPackageData.push(...packageData)

    const endTime = Date.now()
    const duration = endTime - startTime
    console.log(
      `Fetched ${packageData.length} packages in ${duration}ms (${Math.round((packageData.length / duration) * 1000)} packages/s)`,
    )
  }

  console.log("Finished fetching package data")
  console.log(`Writing package data to '${packageDataFile.name}'...`)
  await packageDataFile.write(JSON.stringify(allPackageData))
  console.log(`Finished writing package data to '${packageDataFile.name}'`)

  return allPackageData
}

type SemverNumbers = [number, number, number]
interface NormalizedPackageData {
  id: string
  largestNumber: {
    num: number
    version: string
  }
  versions: SemverNumbers[]
}

/**
 * Transforms package data so that it includes the largest number from all of its versions.
 * In each `versions` array, only valid semver versions are kept.
 */
function normalizePackageData(packageData: PackageData[]): NormalizedPackageData[] {
  console.log("Getting normalized package data...")
  const normalizedPackageData = packageData
    .map((pkg) => {
      const semverVersions = pkg.versions
        .map((version) => splitSemver(version))
        .filter((version) => version !== undefined)
      if (semverVersions.length === 0) return // if the package didn't have any valid semver versions, don't include it

      let largestNumber = { num: 0, version: "" }
      for (const semver of semverVersions) {
        const [major, minor, patch] = semver
        const num = Math.max(major, minor, patch)
        if (num > largestNumber.num) largestNumber = { num, version: semver.join(".") }
      }

      const normalizedPackage = { id: pkg.id, largestNumber, versions: semverVersions }
      return normalizedPackage
    })
    .filter((pkg) => pkg !== undefined)

  console.log("Finished getting normalized package data")

  return normalizedPackageData
}

await main()

/* UTILS */

/**
 *
 * Splits a valid semver string into an array of three number: `[major, minor, patch]`
 * If the string is not a valid semver, `undefined` is returned.
 */
function splitSemver(version: string): SemverNumbers | undefined {
  const versionParts = version.split(".").map((part) => Number.isInteger(Number(part)) && Number.parseInt(part, 10))
  if (versionParts.length !== 3) return
  const [major, minor, patch] = versionParts
  if (!(major && minor && patch)) return
  return [major, minor, patch]
}

/**
 * Calls `console.error` with the message and appends the message to a `error.log` file.
 */
function logError(message: string) {
  console.error(message)
  fs.appendFile("error.log", message)
}

/**
 * Fetches the url and returns the JSON response object. Calls {@link logError} and returns `undefined` instead of throwing if an error occurs.
 */
async function fetchJson<T>(url: string): Promise<T | undefined> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`(${response.status}) ${await response.text()}`)
    return (await response.json()) as T
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logError(`something went wrong fetching json for '${url}': ${errorMessage}`)
  }

  return
}
```
