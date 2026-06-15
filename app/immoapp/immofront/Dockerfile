FROM node:22-alpine AS build
ARG VITE_API_BASE_URL
ARG VITE_CDN_BASE_URL
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS prod
ARG VITE_API_BASE_URL
ARG VITE_CDN_BASE_URL
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i "s|{{VITE_API_BASE_URL}}|${VITE_API_BASE_URL}|g" /etc/nginx/conf.d/default.conf && \
    sed -i "s|{{VITE_CDN_BASE_URL}}|${VITE_CDN_BASE_URL}|g" /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
