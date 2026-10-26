import { task } from "@adamhl8/bask"
import { build, lint } from "@adamhl8/configs/bask"

export * from "@adamhl8/configs/bask"

export const clean = task(async ({ sh }) => {
  await sh`rm -rf dist .astro node_modules/.astro`
})

export const generateResume = task(async ({ sh }) => {
  await sh`resumed render ./src/pages/_resume.json --theme jsonresume-theme-react-tailwind --output ./src/pages/resume.html`
})

export const buildSite = task(async ({ sh }) => {
  await sh`bun ./scripts/process-favicon.ts`
  await sh`astro build`
})

export const astroSync = task(async ({ sh }) => {
  await sh`astro sync`
})

export const dev = task(async ({ sh }) => {
  await sh`astro dev`
})

export const preview = task(async ({ sh }) => {
  await sh`astro preview`
})

export const obsidianShare = task(async ({ sh }) => {
  await sh`bun ./scripts/obsidian-share.ts`
})

// Add Astro type checking to `lint` once TypeScript 7.1 is stable.
// `astro check` won't support TypeScript 7, so use `tsc` with `@astrojs/ts-content-mapper`.
lint.before(astroSync)
build.before(clean, generateResume)
build.after(buildSite)
