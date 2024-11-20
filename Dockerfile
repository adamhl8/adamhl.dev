FROM oven/bun:1.1.34 AS build
WORKDIR /app

COPY package.json .
COPY bun.lockb .
RUN bun i
COPY . .
RUN bun run build

FROM caddy:latest
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
