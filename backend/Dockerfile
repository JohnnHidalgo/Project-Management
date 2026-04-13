FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install dev dependencies needed for build & prisma
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --production=false

# Copy source files and prisma schema
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY src ./src
COPY . .

# Generate Prisma client and build typescript
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build
RUN find dist -type f -name '*.js' -exec sed -i "s@from '../.prisma/client';@from '../.prisma/client/index.js';@g" {} \;
RUN find dist -type f -name '*.js' -exec sed -i 's@from "../.prisma/client";@from "../.prisma/client/index.js";@g' {} \;

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS=--es-module-specifier-resolution=node

# Copy runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.prisma ./.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/.prisma ./dist/.prisma

# Copy entrypoint and make it executable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]