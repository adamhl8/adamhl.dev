FROM oven/bun:latest AS base
LABEL org.opencontainers.image.source=https://github.com/adamhl8/adamhl.dev
WORKDIR /app
ENV NODE_ENV="production"

COPY package.json bun.lock bunfig.toml ./

FROM base AS build

RUN bun install --ignore-scripts

COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY astro.config.ts ./
COPY bask.ts ./
COPY tsconfig.json ./

RUN --mount=type=secret,id=GH_TOKEN,env=GITHUB_TOKEN \
  bunx bask build-site

FROM base

RUN bun install --ignore-scripts --production

COPY --from=build /app/dist ./dist

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["bun", "./dist/server/entry.mjs"]
