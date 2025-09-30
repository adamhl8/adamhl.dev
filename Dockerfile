FROM oven/bun:latest AS base
WORKDIR /app
ENV NODE_ENV="production"
ENV BUN_OPTIONS="--bun"

FROM base AS deps

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS build

COPY --from=deps /temp/dev/node_modules ./node_modules
COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY astro.config.ts ./
COPY package.json ./
COPY tsconfig.json ./

RUN bun bundle:prod

FROM base

COPY --from=deps /temp/prod/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["bun", "start:prod"]
