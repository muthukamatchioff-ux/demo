FROM node:20-bookworm-slim AS builder

WORKDIR /app

# ---------------------------------------------------------
# Install OpenSSL for Prisma
# ---------------------------------------------------------
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Copy package files
# ---------------------------------------------------------
COPY package.json package-lock.json ./

# ---------------------------------------------------------
# Install dependencies
# ---------------------------------------------------------
RUN npm ci

# ---------------------------------------------------------
# Copy application source
# ---------------------------------------------------------
COPY . .

# ---------------------------------------------------------
# Validate Prisma schema BEFORE generating client
# ---------------------------------------------------------
RUN npx prisma validate

# ---------------------------------------------------------
# Generate Prisma Client
# ---------------------------------------------------------
RUN npx prisma generate

# ---------------------------------------------------------
# Build TypeScript application
# ---------------------------------------------------------
RUN npm run build


# =========================================================
# Production Image
# =========================================================

FROM node:20-bookworm-slim

WORKDIR /app

# ---------------------------------------------------------
# Install OpenSSL required by Prisma
# ---------------------------------------------------------
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# Copy package files
# ---------------------------------------------------------
COPY package.json package-lock.json ./

# ---------------------------------------------------------
# Install production dependencies
# ---------------------------------------------------------
RUN npm ci --omit=dev

# ---------------------------------------------------------
# Copy Prisma generated client
# ---------------------------------------------------------
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# ---------------------------------------------------------
# Copy compiled application
# ---------------------------------------------------------
COPY --from=builder /app/dist ./dist

# ---------------------------------------------------------
# Copy Prisma schema and migrations
# ---------------------------------------------------------
COPY --from=builder /app/prisma ./prisma

# ---------------------------------------------------------
# Copy frontend/public files
# ---------------------------------------------------------
COPY --from=builder /app/public ./public

# ---------------------------------------------------------
# Production environment
# ---------------------------------------------------------
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# ---------------------------------------------------------
# Run migrations and start server
# ---------------------------------------------------------
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
