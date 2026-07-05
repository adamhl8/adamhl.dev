import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

clean:
    rm -rf dist .astro

generate-resume:
    resumed render ./src/pages/_resume.json -t jsonresume-theme-react-tailwind -o ./src/pages/resume.html

lint: astro-sync _lint
    astro check

build: clean generate-resume _build build-site

build-site:
    nub ./scripts/process-favicon.ts
    astro build

astro-sync:
    astro sync

dev:
    astro dev

preview:
    astro preview

obsidian-share:
    nub ./scripts/obsidian-share.ts
