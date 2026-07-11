FROM oven/bun:canary AS base
LABEL org.opencontainers.image.source=https://github.com/adamhl8/adamhl.dev
WORKDIR /app
ENV NODE_ENV="production"

FROM base AS build

COPY --from=ghcr.io/casey/just:latest /just /usr/local/bin/

COPY package.json bun.lock ./

RUN bun install --ignore-scripts

COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY astro.config.ts ./
COPY justfile ./
COPY tsconfig.json ./

RUN --mount=type=secret,id=GH_TOKEN,env=GITHUB_TOKEN \
  just build-site

FROM base

COPY package.json bun.lock ./

RUN bun install --ignore-scripts --prod

COPY --from=build /app/dist ./dist

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["bun", "./dist/server/entry.mjs"]
