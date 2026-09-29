# =========================================================
# PM-SETU Documentation Portal
# Dockerfile for Render
# Node.js 20 + Prisma + PostgreSQL
# =========================================================

# =========================================================
# BUILD STAGE
# =========================================================

FROM node:20-bookworm-slim AS builder

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
# Install all dependencies
# ---------------------------------------------------------

RUN npm ci

# ---------------------------------------------------------
# Copy complete application source
# ---------------------------------------------------------

COPY . .

# ---------------------------------------------------------
# Generate Prisma Client
# DATABASE_URL is NOT required for prisma generate
# ---------------------------------------------------------

RUN npx prisma generate

# ---------------------------------------------------------
# Build TypeScript application
# ---------------------------------------------------------

RUN npm run build


# =========================================================
# PRODUCTION STAGE
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
# Install production dependencies only
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
COPY --from=builder /app/scripts ./scripts
# ---------------------------------------------------------
# Copy frontend / public files
# ---------------------------------------------------------

COPY --from=builder /app/public ./public

# ---------------------------------------------------------
# Production environment
# ---------------------------------------------------------

ENV NODE_ENV=production
ENV PORT=8080

# ---------------------------------------------------------
# Render uses PORT 8080
# ---------------------------------------------------------

EXPOSE 8080

# ---------------------------------------------------------
# Start application
#
# DATABASE_URL is supplied by Render Environment Variables
# ---------------------------------------------------------

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
