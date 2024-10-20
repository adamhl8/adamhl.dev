#!/usr/bin/env bun

import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import * as yaml from "yaml"

const OBSIDIAN_DIR = `${os.homedir()}/Obsidian`
const SHARE_DIR = "src/content/share"

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/
const TITLE_REGEX = /#\s(.+)\n\n---\n\n/

interface FileDetails {
  fileName: string
  destFilePath: string
  frontmatter: Record<string, unknown>
  content: string
}

async function copySharedFile(filePath: string): Promise<FileDetails | undefined> {
  const content = await fs.readFile(filePath, "utf-8")
  const frontmatterMatch = content.match(FRONTMATTER_REGEX)

  if (!frontmatterMatch?.[1]) return

  const frontmatter = yaml.parse(frontmatterMatch[1]) as Record<string, unknown>

  if (frontmatter.share !== true) return

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
  const { destFilePath, content, frontmatter } = fileDetails

  // Remove the title heading
  const titleMatch = content.match(TITLE_REGEX)
  let processedContent = content.replace(TITLE_REGEX, "")

  // Update frontmatter
  frontmatter.title = titleMatch ? titleMatch[1] : "Untitled"
  frontmatter.date = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

  const updatedFrontmatter = yaml.stringify(frontmatter)
  processedContent = processedContent.replace(FRONTMATTER_REGEX, `---\n${updatedFrontmatter}---`)

  await fs.writeFile(destFilePath, processedContent, "utf-8")
}

async function main() {
  await fs.rm(SHARE_DIR, { recursive: true, force: true })
  await fs.mkdir(SHARE_DIR)

  console.info("Reading vault...")
  const files = await fs.readdir(OBSIDIAN_DIR, { recursive: true })
  for (const file of files) {
    if (!file.endsWith(".md")) continue

    const obsidianFilePath = path.join(OBSIDIAN_DIR, file)
    const fileDetails = await copySharedFile(obsidianFilePath)
    if (!fileDetails) continue
    console.info()
    console.info(`Copied ${fileDetails.fileName}`)

    await processFile(fileDetails)
    console.info(`Processed ${fileDetails.fileName}`)
  }
}

await main()
