FROM oven/bun:latest AS base
WORKDIR /app
ENV NODE_ENV="production"
ENV BUN_OPTIONS="--bun"

FROM base AS deps

# --ignore-scripts: the prepare script runs `just prepare` (lefthook), which doesn't exist in the image
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && bun install --ignore-scripts

RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --ignore-scripts --production

FROM base AS build

COPY --from=deps /temp/dev/node_modules ./node_modules
COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY astro.config.ts ./
COPY package.json ./
COPY tsconfig.json ./

RUN --mount=type=secret,id=GH_TOKEN,env=GITHUB_TOKEN bun ./scripts/process-favicon.ts && bun run astro build

FROM base

COPY --from=deps /temp/prod/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["bun", "./dist/server/entry.mjs"]
