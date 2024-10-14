FROM caddy:latest
COPY public /srv
COPY Caddyfile /etc/caddy/Caddyfile
