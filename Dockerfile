# Multi-stage Dockerfile for Genetic Explorer

# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Install SQLite for database
RUN apk add --no-cache sqlite-libs

WORKDIR /app

# Create data and uploads directories
RUN mkdir -p data uploads/genomes uploads/temp uploads/exports

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/app.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATABASE_URL=./data/genetic_explorer.db
ENV UPLOADS_DIR=./uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
