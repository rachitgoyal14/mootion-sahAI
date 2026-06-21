# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the frontend assets and compile/bundle server.ts
RUN npm run build

# Runner Stage
FROM node:18-alpine

WORKDIR /app

# Copy the built distribution and configuration files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/package-lock.json ./

# Install only production dependencies (since server.cjs references node_modules externally)
RUN npm ci --only=production

# Set production host / port
ENV NODE_ENV=production \
    PORT=3000

# Expose server port
EXPOSE 3000

# Start production server
CMD ["node", "dist/server.cjs"]
