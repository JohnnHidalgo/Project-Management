FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies and generate Prisma client
COPY package.json package-lock.json tsconfig.json prisma/ ./
COPY .env ./
COPY src ./src
RUN npm run build

# Copy compiled files and Prisma client into dist
RUN mkdir -p dist/.prisma
RUN cp -R .prisma dist/.prisma

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3002
CMD ["node", "dist/src/index.js"]
