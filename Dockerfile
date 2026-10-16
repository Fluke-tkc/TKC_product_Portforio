# Build the site with Node, then serve the static build with nginx (nginx.conf).
# The SSL certificate and key are not in the image: docker-compose.yml mounts them from the host.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
