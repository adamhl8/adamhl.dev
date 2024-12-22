FROM oven/bun:latest AS build
WORKDIR /app

COPY package.json .
COPY bun.lock .
RUN bun i
COPY . .
RUN bun run build

FROM caddy:latest
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
