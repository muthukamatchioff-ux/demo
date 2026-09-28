FROM node:18-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
<<<<<<< HEAD
...
=======
...


# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# Production image
FROM node:18-bookworm-slim

WORKDIR /app

# Install OpenSSL for Prisma
<<<<<<< HEAD
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Install production dependencies
=======
RUN apk add --no-cache openssl

# Install production dependencies only

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy generated Prisma and application files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY public ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node dist/server.js"]

<<<<<<< HEAD
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node dist/server.js"]
=======
# Run migrations and start application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
>>>>>>> ec1d3c0 (Fix production session storage)
