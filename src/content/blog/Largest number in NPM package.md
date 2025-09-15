---
title: "Which npm package has the largest version number?"
description: "I spent way too much time on this"
date: 2025-09-14
tags: [npm, typescript, javascript]
---

I was recently working on a project that uses the [AWS SDK for JavaScript](https://github.com/aws/aws-sdk-js-v3). When updating the dependencies in said project, I noticed that the version of that dependency was `v3.888.0`. Eight hundred eighty eight. That's a big number as far as versions go.

That got me thinking: I wonder what package in the [npm registry](https://www.npmjs.com) has the largest number in its version. It could be a major, minor, or patch version, and it doesn't have to be the latest version of the package. In other words, out of the three numbers in `<major>.<minor>.<patch>` for each version for each package, what is the largest number I can find?

**TL;DR? [Jump to the results](#results)** to see the answer.

## The npm API

Obviously npm has some kind of API, so it shouldn't be too hard to get a list of all... [3,639,812 packages](https://www.npmjs.com/#:~:text=Packages-,3%2C639%2C812,-Downloads%20%C2%B7%20Last). Oh. That's a lot of packages. Well, considering npm had 374 _billion_ package downloads in the past _month_, I'm sure they wouldn't mind me making a few million HTTP requests.

Doing a quick search for "npm api" leads me to a readme in the [npm/registry repo](https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md) on GitHub. There's a `/-/all` endpoint listed in the table of contents which seems promising. That section doesn't actually exist in the readme, but maybe it still works?

```sh
$ curl 'https://registry.npmjs.org/-/all'
{"code":"ResourceNotFound","message":"/-/all does not exist"}
```

Whelp, maybe npm packages have an ID and I can just start at 1 and count up? It looks like packages have an `_id` field... never mind, the `_id` field is the package _name_. Okay, let's try to find something else.

A little more digging brings me to this [GitHub discussion](https://github.com/orgs/community/discussions/152515) about the npm replication API. So npm replicates package info in CouchDB at `https://replicate.npmjs.com`, and conveniently, they support the [`_all_docs` endpoint](https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-all-docs). Let's give that a try:

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

Fortunately, the CouchDB docs have a [guide for pagination](https://docs.couchdb.org/en/latest/ddocs/views/pagination.html#paging), and it looks like it's as simple as using the `skip` query parameter.

```sh
$ curl 'https://replicate.npmjs.com/registry/_all_docs?skip=1000'
"Bad Request"
```

Never mind. According to the GitHub discussion linked above, `skip` is no longer supported. The "Paging (Alternate Method)" section of the same page says that I can use `startkey_docid` instead. If I grab the `id` of the last row, I should be able to use that to return the next set of rows. Fun fact: The 1000th package (alphabetically) on npm is `03-webpack-number-test`.

```sh
$ curl 'https://replicate.npmjs.com/registry/_all_docs?startkey_docid="03-webpack-number-test"'
{
    "total_rows" : 3628102,
    "offset" : 999,
    "rows" : [
    # another 1000 packages...
```

Nice. Also, another `3628102 - 3628088 = 14` packages have been published in the ~15 minutes since I ran the last query.

Now, there's one more piece of the puzzle to figure out. How do I get all the versions for a given package? Unfortunately, it doesn't seem like I can get package version information along with the base info returned by `_all_docs`. I have to _separately_ fetch each package's metadata from `https://registry.npmjs.org/<package_id>`. Let's see what good ol' trusty `03-webpack-number-test` looks like:

```sh
$ curl 'https://registry.npmjs.org/03-webpack-number-test'
{
    # i've omitted some fields here
    "_id" : "03-webpack-number-test",
    "versions" : {
      "1.0.0" : { ... },
      # the rest of the versions...
```

Alright, I have everything I need. Now I just need to write a bash script that— just kidding. A wise programmer once said, "if your shell script is more than 10 lines, it shouldn't be a shell script" (that was me, I said that). I like TypeScript, so let's use that.

The biggest bottleneck is going to be waiting on the `GET`s for each package's metadata. My plan is this:

- Grab all the package IDs from the replication API and save that data to a file (I don't want to have to refetch everything if the something goes wrong later in the script)
- Fetch package data in batches so we're not just doing 1 HTTP request at a time
- Save the package data to a file (again, hopefully I only have to fetch everything once)

Once I have all the package data, I can answer the original question of "largest number in version" and look at a few other interesting things.

(A few hours and many iterations later...)

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

See the [script section](#script) at the end if you want to see what it looks like.

## Results

Some stats:

- Time to fetch all ~3.6 million package _IDs_: **A few minutes**
- Time to fetch version data for each one of those packages: **~12 hours** (yikes)
- Packages fetched per second: **~84 packages/s**
- Size of `package-ids.json`: **~78MB**
- Size of `package-data.json`: **~886MB**

**And the winner is...** (not really) [latentflip-test](https://www.npmjs.com/package/latentflip-test?activeTab=versions) at version `1000000000000000000.1000000000000000000.1000000000000000000`. And no, there haven't actually been one quintillion major versions of this package published. Disappointing, I know.

Okay, I feel like that shouldn't count. I think we can do better and find a "real" package that actually follows semantic versioning. I think a better question to ask is this:

**For packages that _follow semantic versioning_, which package has the _largest number_ from `<major>.<minor>.<patch>` in _any_ of its versions?**

So, what does it mean to "follow semantic versioning"? Should we "disqualify" a package for skipping a version number? In this case, I think we'll just say that a package has to have more versions published than the largest number we find for that package. For example, a package with a version of `1.888.0` will have had _at least_ 888 versions published if it actually followed semver.

Before we get to the real winner, here are the top 10 packages _by total number of versions published_:

```
1. electron-remote-control -> 37328 total versions
2. @npm-torg/public-scoped-free-org-test-package-2 -> 37134 total versions
3. public-unscoped-test-package -> 27719 total versions
4. carrot-scan -> 27708 total versions
5. @npm-torg/public-test-package-2 -> 27406 total versions
6. @octopusdeploy/design-system-components -> 26724 total versions
7. @octopusdeploy/type-utils -> 26708 total versions
8. @octopusdeploy/design-system-tokens -> 22122 total versions
9. @mahdiarjangi/phetch-cli -> 19498 total versions
10. @atlassian-test-prod/hello-world -> 19120 total versions
```

Top 10 packages that (probably) follow semver _by largest number in one of its versions_:

```
1. @mahdiarjangi/phetch-cli -> 19494 (1.0.19494)
2. electron-remote-control -> 19065 (1.2.19065)
3. @quip/collab -> 16999 (1.16999.0)
4. @atlassian-test-prod/hello-world -> 16707 (9.7.16707)
5. @wix/wix-code-types -> 14720 (2.0.14720)
6. @octopusdeploy/design-system-components -> 14274 (2025.3.14274)
7. @octopusdeploy/type-utils -> 14274 (2025.3.14274)
8. @octopusdeploy/design-system-tokens -> 14274 (2025.3.14274)
9. @atlassian-test-staging/test -> 13214 (49.4.13214)
10. binky -> 9906 (3.4.9906)
```

So it seems like the winner is [@mahdiarjangi/phetch-cli](https://github.com/DinoscapeProgramming/Remote-Control) with `19494`, right? Unfortunately, I'm not going to count that either. It only has so many versions because of a [misconfigured GitHub action](https://github.com/arjangimahdi/phetch-cli/actions/runs/11531682007/workflow) that published new versions in a loop.

I manually went down the above list, disqualifying any packages that had similar issues. I also checked that "new" versions actually differed from previous versions in terms of content. Overall, I looked for a package that was actually publishing new versions on purpose with _some_ kind of change to the package content.

**The real winner (#19 on the list) is:** [all-the-package-names](https://github.com/nice-registry/all-the-package-names) with `2401` from version `2.0.2401`.

Well, that's sort of disappointing, but also kind of funny. I don't know what I was expecting to be honest. If you're curious, you can see [more results](#more-results) at the bottom of this post.

What you do with all of this extremely important and useful information is up to you.

## Script

```ts
/* This script uses Bun specific APIs and should be executed directly with Bun */

import fs from "node:fs/promises"
import process from "node:process"

async function main() {
  const NUM_TO_PRINT = 50

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
  packagsByNumOfVersions.slice(0, NUM_TO_PRINT).forEach(({ id, versions }, i) => {
    console.log(`${i + 1}. ${id} -> ${versions.length} total versions`)
  })

  const logPackagesByLargestNumber = (packages: NormalizedPackageData[]) => {
    packages.slice(0, NUM_TO_PRINT).forEach(({ id, largestNumber }, i) => {
      console.log(`${i + 1}. ${id} -> ${largestNumber.num} (${largestNumber.version})`)
    })
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
  "@mahdiarjangi/phetch-cli",
  "electron-remote-control",
  "@quip/collab",
  "@atlassian-test",
  "@wix/wix-code-types",
  "@octopusdeploy",
  "binky",
  "carrot-scan",
  "terrapin-test-1",
  "@prisma/language-server",
  "kse-visilia",
  "intraactive-sdk-ui",
  "@idxdb/promised",
  "wix-style-react",
  "botfather",
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
  const versionParts = version
    .split(".")
    .slice(0, 3)
    .map((part) => (Number.isInteger(Number(part)) ? Number.parseInt(part, 10) : undefined))
    .filter((part) => part !== undefined)
  if (versionParts.length !== 3) return
  const [major, minor, patch] = versionParts as SemverNumbers
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

## More Results

This is from the script:

```
Top 50 packages by total number of versions published:
1. electron-remote-control -> 37328 total versions
2. @npm-torg/public-scoped-free-org-test-package-2 -> 37134 total versions
3. public-unscoped-test-package -> 27719 total versions
4. carrot-scan -> 27708 total versions
5. @npm-torg/public-test-package-2 -> 27406 total versions
6. @octopusdeploy/design-system-components -> 26724 total versions
7. @octopusdeploy/type-utils -> 26708 total versions
8. @octopusdeploy/design-system-tokens -> 22122 total versions
9. @mahdiarjangi/phetch-cli -> 19498 total versions
10. @atlassian-test-prod/hello-world -> 19120 total versions
11. @quip/collab -> 17004 total versions
12. @gitpod/gitpod-protocol -> 16145 total versions
13. ricos-build-cache -> 15867 total versions
14. @wix/wix-code-types -> 15030 total versions
15. @gitpod/supervisor-api-grpc -> 14364 total versions
16. @atlassian-test-staging/test -> 13330 total versions
17. @yuming2022/app-dnpkg-beta -> 12995 total versions
18. nocodb-sdk-daily -> 12512 total versions
19. @dais/sdk-minimal -> 12090 total versions
20. nc-lib-gui-daily -> 11874 total versions
21. binky -> 11460 total versions
22. nocodb-daily -> 11283 total versions
23. construct-hub-probe -> 10822 total versions
24. renovate -> 10369 total versions
25. @primer/react -> 10320 total versions
26. @codecademy/styleguide -> 10186 total versions
27. @prisma/client -> 10064 total versions
28. @prisma/migrate -> 9994 total versions
29. @prisma/generator-helper -> 9847 total versions
30. decentraland-renderer -> 9640 total versions
31. gfcdn.startpage -> 9580 total versions
32. @prisma/debug -> 9521 total versions
33. @codecademy/gamut -> 9411 total versions
34. @coral-xyz/xnft-cli -> 9397 total versions
35. @birdeye-so/tokenswap -> 9382 total versions
36. @pdftron/webviewer -> 9373 total versions
37. @gitpod/supervisor-api-grpcweb -> 9274 total versions
38. @gitpod/local-app-api-grpcweb -> 9177 total versions
39. kse-visilia -> 9150 total versions
40. @prisma/fetch-engine -> 8988 total versions
41. @coral-xyz/common -> 8946 total versions
42. @prisma/get-platform -> 8926 total versions
43. @materializeinc/sql-lexer -> 8868 total versions
44. xnft -> 8846 total versions
45. @prisma/language-server -> 8826 total versions
46. prisma -> 8675 total versions
47. @stoplight/cli -> 8455 total versions
48. electron-apps -> 8445 total versions
49. @knapsack/schema-utils -> 8332 total versions
50. @knapsack/utils -> 8323 total versions
```

```
Top 50 packages that follow semver by largest number in version:
1. @mahdiarjangi/phetch-cli -> 19494 (1.0.19494)
2. electron-remote-control -> 19065 (1.2.19065)
3. @quip/collab -> 16999 (1.16999.0)
4. @atlassian-test-prod/hello-world -> 16707 (9.7.16707)
5. @wix/wix-code-types -> 14720 (2.0.14720)
6. @octopusdeploy/design-system-components -> 14274 (2025.3.14274)
7. @octopusdeploy/type-utils -> 14274 (2025.3.14274)
8. @octopusdeploy/design-system-tokens -> 14274 (2025.3.14274)
9. @atlassian-test-staging/test -> 13214 (49.4.13214)
10. binky -> 9906 (3.4.9906)
11. carrot-scan -> 9809 (5.0.9809)
12. terrapin-test-1 -> 8151 (1.0.8151)
13. @prisma/language-server -> 7906 (31.0.7906)
14. kse-visilia -> 5997 (1.6.5997)
15. intraactive-sdk-ui -> 4752 (1.1.4752)
16. @idxdb/promised -> 4614 (2.3.4614)
17. wix-style-react -> 4264 (1.1.4264)
18. botfather -> 4058 (3.6.4058)
19. all-the-package-names -> 3905 (1.3905.0)
20. @openactive/rpde-validator -> 3571 (3.0.3571)
21. electron-i18n -> 3136 (1.3136.0)
22. warframe-items -> 3060 (1.1253.3060)
23. ebt-vue -> 3053 (1.55.3053)
24. @geometryzen/jsxgraph -> 3022 (1.6.3022)
25. @deriv/api-types -> 2760 (1.0.2760)
26. eslint-config-innovorder-v2 -> 2730 (2.2730.6)
27. @innovorder/serverless-resize-bucket-images -> 2730 (2.2730.6)
28. @zuplo/runtime -> 2544 (5.2544.0)
29. @zuplo/core -> 2544 (5.2544.0)
30. membership-tpa-translations -> 2515 (1.0.2515)
31. all-the-package-repos -> 2401 (2.0.2401)
32. @stoplight/cli -> 2400 (6.0.2400)
33. @xuda.io/xuda-worker-bundle -> 2366 (1.3.2366)
34. react-module-container -> 2356 (1.0.2356)
35. @abtasty/pulsar-common-ui -> 2314 (1.1.2314)
36. @xuda.io/xuda-worker-bundle-min -> 2256 (1.3.2256)
37. @wppconnect/wa-version -> 2215 (1.5.2215)
38. react-home-ar -> 2195 (0.0.2195)
39. @parative/library -> 2145 (3.4.2145)
40. @lightdash/cli -> 2001 (0.2001.1)
41. @lightdash/common -> 2001 (0.2001.1)
42. @lightdash/warehouses -> 2001 (0.2001.1)
43. @eigenspace/framer-bundle-minifier -> 1930 (0.0.1930)
44. carpams -> 1919 (1.1.1919)
45. @eth-optimism/tokenlist -> 1714 (10.0.1714)
46. aws-sdk -> 1692 (2.1692.0)
47. hypothesis -> 1688 (1.1688.0)
48. ros.grant.common -> 1681 (2.0.1681)
49. commons-validator-js -> 1669 (1.0.1669)
50. mol_regexp -> 1632 (0.0.1632)
```
