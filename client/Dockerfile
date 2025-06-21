# Use official Node.js image to build the app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Use a lightweight web server to serve static files
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]