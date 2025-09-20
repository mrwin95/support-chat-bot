# Use Node.js LTS Alpine for smaller size
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- Runtime image ---
FROM node:22-alpine

WORKDIR /usr/src/app

# Only copy compiled JS and necessary files
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]