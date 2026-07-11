import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

clean:
    rm -rf dist .astro node_modules/.astro

generate-resume:
    resumed render ./src/pages/_resume.json -t jsonresume-theme-react-tailwind -o ./src/pages/resume.html

lint: astro-sync _lint
    # TODO: run `astro check` once working with typescript 7

build: clean generate-resume _build build-site

build-site:
    bun ./scripts/process-favicon.ts
    astro build

astro-sync:
    astro sync

dev:
    astro dev

preview:
    astro preview

obsidian-share:
    bun ./scripts/obsidian-share.ts
