# ---- Build Stage ----
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source
COPY . .

# Install quasar cli and build
RUN npm install -g @quasar/cli
RUN quasar build

# ---- Serve Stage ----
FROM nginx:stable-alpine AS serve

# Copy built files to nginx html folder
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Replace default nginx config (for SPA routing)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]