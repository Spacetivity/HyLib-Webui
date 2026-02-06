# HyMessage WebUI – Build & serve in Docker
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files from root
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files from root
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
