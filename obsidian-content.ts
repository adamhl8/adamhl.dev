import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import yaml from "js-yaml"

const OBSIDIAN_DIR = `${os.homedir()}/Obsidian`
const QUARTZ_DIR = `${OBSIDIAN_DIR}/Quartz`
const CONTENT_DIR = "content"

async function copyDirectory(src: string, dest: string) {
  await fs.rm(dest, { recursive: true, force: true })
  await fs.cp(src, dest, { recursive: true })
}

async function processMarkdownFile(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8")
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

  if (frontmatterMatch) {
    const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, unknown>

    if (
      frontmatter["quartz-publish"] === true &&
      typeof frontmatter["quartz-content-path"] === "string"
    ) {
      const destDirPath = path.join(CONTENT_DIR, frontmatter["quartz-content-path"])
      const destFilePath = path.join(destDirPath, path.basename(filePath))
      await fs.mkdir(destDirPath, { recursive: true })
      await fs.copyFile(filePath, destFilePath)
    }
  }
}

async function main() {
  await copyDirectory(QUARTZ_DIR, CONTENT_DIR)

  const files = await fs.readdir(OBSIDIAN_DIR, { recursive: true })
  for (const file of files) {
    if (file.endsWith(".md")) {
      await processMarkdownFile(path.join(OBSIDIAN_DIR, file))
    }
  }
}

await main()
