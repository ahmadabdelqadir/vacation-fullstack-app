# syntax=docker/dockerfile:1
# Build context: project root. Invoked via docker-compose.yml.

FROM node:20-alpine AS build
WORKDIR /app
COPY Backend/package*.json ./
RUN npm ci
COPY Backend/tsconfig.json ./
COPY Backend/src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY Backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# Bundle seed images at a fallback path the seeder knows how to resolve.
COPY Database/seed/images ./dist/assets/seed-images

# Runtime image folder (mounted as a volume in docker-compose).
RUN mkdir -p /app/dist/assets/images

EXPOSE 4000
CMD ["node", "dist/app.js"]
