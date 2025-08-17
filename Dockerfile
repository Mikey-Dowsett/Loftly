# ---- Build Stage ----
FROM node:24.6.0-slim AS build

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

# Set production environment
ENV NODE_ENV=development

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install dependencies including local Quasar CLI
RUN npm ci

# Copy all source code
COPY . .

# Build SPA using local Quasar CLI
RUN npx quasar build

# ---- Serve Stage ----
FROM nginx:stable-alpine AS serve

# Copy built SPA files
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Replace default nginx config for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Expose port 80 for Fly.io
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]