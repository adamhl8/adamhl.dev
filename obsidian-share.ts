#!/usr/bin/env bun
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import * as v from "valibot"
import * as yaml from "yaml"

const frontmatterSchema = v.object({
  share: v.optional(v.boolean()),
  title: v.optional(v.string()),
  date: v.optional(v.string()),
})
type Frontmatter = v.InferOutput<typeof frontmatterSchema>

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

async function copySharedFile(filePath: string): Promise<FileDetails | undefined> {
  const content = await fs.readFile(filePath, "utf8")
  const frontmatterMatch = FRONTMATTER_REGEX.exec(content)

  const frontmatterGroup = frontmatterMatch?.groups?.["frontmatter"]
  if (!frontmatterGroup) return

  const frontmatterYaml: unknown = yaml.parse(frontmatterGroup)
  const frontmatter = v.parse(frontmatterSchema, frontmatterYaml)

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

async function processFile(fileDetails: FileDetails) {
  const { destFilePath, content, frontmatter, fileName } = fileDetails

  // Remove the title heading
  const titleMatch = TITLE_REGEX.exec(content)
  let processedContent = content.replace(TITLE_REGEX, "")

  // Update frontmatter
  frontmatter.title = titleMatch?.groups?.["title"] ?? fileName
  const date = new Date().toISOString().split("T")[0]
  if (!date) throw new Error("Failed to get date")
  frontmatter.date = date // YYYY-MM-DD format

  const updatedFrontmatter = yaml.stringify(frontmatter)
  processedContent = processedContent.replace(FRONTMATTER_REGEX, `---\n${updatedFrontmatter}---`)

  await fs.writeFile(destFilePath, processedContent, "utf8")
}

async function main() {
  await fs.rm(SHARE_DIR, { recursive: true, force: true })
  await fs.mkdir(SHARE_DIR)

  console.info("Reading vault...")
  const files = await fs.readdir(OBSIDIAN_DIR, { recursive: true })

  const fileDetailsPromises: Promise<FileDetails | undefined>[] = []
  for (const file of files) {
    if (!file.endsWith(".md")) continue

    const obsidianFilePath = path.join(OBSIDIAN_DIR, file)
    const fileDetailsPromise = copySharedFile(obsidianFilePath)
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
