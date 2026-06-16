FROM node:22-alpine AS build
ARG VITE_API_BASE_URL
ARG VITE_CDN_BASE_URL
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS prod
ARG NGINX_API_BASE_URL
ARG NGINX_CDN_BASE_URL
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache openssl && \
    sed -i "s|{{API_BASE_URL}}|${NGINX_API_BASE_URL}|g" /etc/nginx/conf.d/default.conf && \
    sed -i "s|{{CDN_BASE_URL}}|${NGINX_CDN_BASE_URL}|g" /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/localhost.key \
      -out /etc/nginx/ssl/localhost.crt \
      -subj "/CN=extranet.y.plaza.local/O=Y-Plaza/C=FR" && \
    apk del openssl
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
