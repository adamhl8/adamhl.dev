#!/usr/bin/env node

import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { type } from "arktype"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

// "+": "delete" drops unknown frontmatter keys so they aren't re-serialized into the shared file
const frontmatterSchema = type({
  "share?": "boolean",
  "title?": "string",
  "date?": "string",
  "+": "delete",
})
type Frontmatter = typeof frontmatterSchema.infer

const OBSIDIAN_DIR = `${os.homedir()}/Obsidian`
const SHARE_DIR = "src/content/share"

const FRONTMATTER_REGEX = /^---\n(?<frontmatter>[\s\S]*?)\n---/v
const TITLE_REGEX = /#\s(?<title>.+)\n{2}---\n{2}/v

interface FileDetails {
  fileName: string
  destFilePath: string
  frontmatter: Frontmatter
  content: string
}

const copySharedFile = async (filePath: string): Promise<FileDetails | undefined> => {
  const content = await fs.readFile(filePath, "utf8")
  const frontmatterMatch = FRONTMATTER_REGEX.exec(content)

  const frontmatterGroup = frontmatterMatch?.groups?.["frontmatter"]
  if (!frontmatterGroup) return

  const frontmatterYaml: unknown = parseYaml(frontmatterGroup)
  const frontmatter = frontmatterSchema.assert(frontmatterYaml)

  if (!frontmatter.share) return

  const fileName = path.basename(filePath)
  const destFilePath = path.join(SHARE_DIR, fileName)
  await fs.copyFile(filePath, destFilePath)

  return {
    fileName,
    destFilePath,
    frontmatter,
    content,
  }
}

const processFile = async (fileDetails: FileDetails) => {
  const { destFilePath, content, frontmatter, fileName } = fileDetails

  // Remove the title heading
  const titleMatch = TITLE_REGEX.exec(content)
  let processedContent = content.replace(TITLE_REGEX, "")

  // Update frontmatter
  frontmatter.title = titleMatch?.groups?.["title"] ?? fileName
  const [date] = new Date().toISOString().split("T")
  if (!date) throw new Error("Failed to get date")
  frontmatter.date = date // YYYY-MM-DD format

  const updatedFrontmatter = stringifyYaml(frontmatter)
  processedContent = processedContent.replace(FRONTMATTER_REGEX, `---\n${updatedFrontmatter}---`)

  await fs.writeFile(destFilePath, processedContent, "utf8")
}

const main = async () => {
  await fs.rm(SHARE_DIR, { recursive: true, force: true })
  await fs.mkdir(SHARE_DIR)

  console.info("Reading vault...")
  const relativeFiles = await Array.fromAsync(fs.glob("**/*.md", { cwd: OBSIDIAN_DIR }))
  const files = relativeFiles.map((file) => path.join(OBSIDIAN_DIR, file))

  const fileDetailsPromises: Promise<FileDetails | undefined>[] = []
  for (const file of files) {
    const fileDetailsPromise = copySharedFile(file)
    fileDetailsPromises.push(fileDetailsPromise)
  }
  const allFileDetails = await Promise.all(fileDetailsPromises)

  const processFilePromises: Promise<void>[] = []
  for (const fileDetails of allFileDetails) {
    if (!fileDetails) continue
    console.info()
    console.info(`Copied ${fileDetails.fileName}`)

    const processFilePromise = async () => {
      await processFile(fileDetails)
      console.info(`Processed ${fileDetails.fileName}`)
    }
    processFilePromises.push(processFilePromise())
  }
  await Promise.all(processFilePromises)
}

await main()
