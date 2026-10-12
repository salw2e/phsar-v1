FROM node:22-slim
WORKDIR /app
# better-sqlite3 compiles itself
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_ENV=production DATABASE_PATH=/data/phsar.db
VOLUME /data
EXPOSE 3000
# builds on start because the build reads the db in /data
CMD ["sh", "-c", "pnpm build && pnpm start"]
