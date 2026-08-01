# ---- Base ----
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
# next build の "Collecting page data" 時に env.ts (@t3-oss/env-nextjs) が走り、
# BETTER_AUTH_SECRET 等の runtime-only secret を要求して失敗するため、
# build 中の env 検証を skip する。runtime (Cloud Run 起動時) で env.ts が再度検証する。
ENV SKIP_ENV_VALIDATION=1
# next.config.ts の images.remotePatterns は build 時に確定するため、
# 許可する GCS バケット名だけは runtime env ではなく build 引数で渡す。
ARG GCS_BUCKET
ENV GCS_BUCKET=$GCS_BUCKET
RUN pnpm build

# ---- Production ----
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema + generated client (needed at runtime)
# - prisma/ : マイグレーション情報の保管 (debug 用途)
# - src/generated/ : Prisma 7 の custom output 先 (アプリ実行時に必要)
# - @prisma : query engine バイナリ等
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh ./

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
