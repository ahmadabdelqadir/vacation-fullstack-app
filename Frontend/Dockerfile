# syntax=docker/dockerfile:1
# Build context: project root. Invoked via docker-compose.yml.

FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY Frontend/package*.json ./
RUN npm ci

# Copy every config Vite / Tailwind / shadcn need at build time.
COPY Frontend/tsconfig*.json ./
COPY Frontend/vite.config.ts ./
COPY Frontend/tailwind.config.js ./
COPY Frontend/postcss.config.js ./
COPY Frontend/components.json ./
COPY Frontend/index.html ./
COPY Frontend/public ./public
COPY Frontend/src ./src

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
