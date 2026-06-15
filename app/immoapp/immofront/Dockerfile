FROM node:22-alpine AS build
ARG VITE_API_BASE_URL
ARG VITE_CDN_BASE_URL
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ARG VITE_API_BASE_URL
ARG VITE_CDN_BASE_URL
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
