# syntax=docker/dockerfile:1

# ============================
# Stage 1: Build
# ============================
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Env Vite ditanam saat build (bukan saat runtime)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ============================
# Stage 2: Production (nginx non-root, port 8080)
# ============================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080