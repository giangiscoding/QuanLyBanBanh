# ---------- Build stage ----------
# Dung Debian slim (khong dung Alpine) de tranh loi OpenSSL cua Prisma.
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Cai dependencies (tan dung cache layer)
COPY package*.json ./
RUN npm ci

# Sinh Prisma Client + bien dich TypeScript -> dist/
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl wget \
    && rm -rf /var/lib/apt/lists/*

# Cai day du dependencies, gom ca devDependencies (prisma CLI + tsx de migrate/seed).
# Phai dung --include=dev vi NODE_ENV=production se khien npm bo qua devDependencies.
COPY package*.json ./
RUN npm ci --include=dev

# Code da bien dich + schema + Prisma Client
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
RUN npx prisma generate

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
