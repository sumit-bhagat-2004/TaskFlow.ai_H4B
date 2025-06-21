# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Expose the port (make sure it matches your .env or server config)
EXPOSE 8000

# Start the server
CMD ["npm", "run", "dev"]