# 🐳 Multi-stage Dockerfile dla OgłoSzybko
FROM node:20-alpine AS base

# Instalacja zależności systemowych
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Kopiuj pliki konfiguracyjne
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./

# 📦 Stage: Zależności
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# 🔧 Stage: Builder
FROM base AS builder
COPY . .
RUN npm ci

# Zbuduj backend
RUN npm run build

# 🚀 Stage: Runner - Finalny obraz produkcyjny
FROM node:20-alpine AS runner
WORKDIR /app

# Dodaj użytkownika niebędącego rootem
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiuj zbudowaną aplikację
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared ./shared

# Utwórz katalog dla uploadów
RUN mkdir -p /app/uploads
RUN chown -R nextjs:nodejs /app/uploads

USER nextjs

# Expose port
EXPOSE 5000

# Zmienne środowiskowe
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Uruchom aplikację
CMD ["node", "dist/index.js"]