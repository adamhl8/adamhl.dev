FROM ghcr.io/nubjs/nub:latest AS base
LABEL org.opencontainers.image.source=https://github.com/adamhl8/adamhl.dev
WORKDIR /app
ENV NODE_ENV="production"

FROM base AS build

COPY --from=ghcr.io/casey/just:latest /just /usr/local/bin/

COPY package.json lock.yaml ./

RUN nub install --frozen-lockfile --ignore-scripts

COPY --chown=node:node public ./public
COPY scripts ./scripts
COPY src ./src
COPY astro.config.ts ./
COPY justfile ./
COPY tsconfig.json ./

RUN --mount=type=secret,id=GH_TOKEN,env=GITHUB_TOKEN \
  just build-site

FROM base

COPY package.json lock.yaml ./

RUN nub install --frozen-lockfile --ignore-scripts --prod

COPY --from=build /app/dist ./dist

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["nub", "./dist/server/entry.mjs"]
