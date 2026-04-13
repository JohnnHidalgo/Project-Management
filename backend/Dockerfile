FROM node:20-alpine AS builder
WORKDIR /app

# 🔥 FIX PRISMA
RUN apk add --no-cache libc6-compat

COPY package*.json tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

# 🔥 FORZAR GENERATE
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY src ./src

RUN npm run build

# -------- RUNNER --------
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules


EXPOSE 3002
CMD ["node", "dist/src/index.js"]