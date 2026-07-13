import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

clean:
    rm -rf dist .astro node_modules/.astro

generate-resume:
    bun resumed render ./src/pages/_resume.json --theme jsonresume-theme-react-tailwind --output ./src/pages/resume.html

lint: astro-sync _lint
    # TODO: run `astro check` once working with typescript 7

build: clean generate-resume _build build-site

build-site:
    bun ./scripts/process-favicon.ts
    bun astro build

astro-sync:
    bun astro sync

dev:
    bun astro dev

preview:
    bun astro preview

obsidian-share:
    bun ./scripts/obsidian-share.ts
