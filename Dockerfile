FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

# Drop backend sources / docker metadata from the static root
RUN rm -rf /usr/share/nginx/html/backend \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/node_modules \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/nginx.conf \
    /usr/share/nginx/html/.env \
    /usr/share/nginx/html/.env.example

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
