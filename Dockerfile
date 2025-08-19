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

# These ARGs pick up env vars injected by Fly
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_API_URL
ARG VITE_URL
ARG VITE_INDIE_MONTHLY
ARG VITE_INDIE_YEARLY
ARG VITE_CREATOR_MONTHLY
ARG VITE_CREATOR_YEARLY


# Set ENV so Vite can read them at build time
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_URL=$VITE_URL
ENV VITE_INDIE_MONTHLY=$VITE_INDIE_MONTHLY
ENV VITE_INDIE_YEARLY=$VITE_INDIE_YEARLY
ENV VITE_CREATOR_MONTHLY=$VITE_CREATOR_MONTHLY
ENV VITE_CREATOR_YEARLY=$VITE_CREATOR_YEARLY

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