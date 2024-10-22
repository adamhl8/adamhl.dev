FROM oven/bun:latest AS build
WORKDIR /app

RUN apt update && apt install -y curl
RUN bash -c "$(curl -fsSL https://zyedidia.github.io/eget.sh)"
RUN ./eget tdewolff/minify --to /usr/local/bin

COPY package.json .
COPY bun.lockb .
RUN bun i
COPY . .
RUN bun run build

FROM caddy:latest
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
