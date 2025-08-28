# Prosty Dockerfile dla OgłoSzybko
FROM node:20-alpine

WORKDIR /app

# Skopiuj wszystko
COPY . .

# Zainstaluj wszystkie zależności
RUN npm install

# Zbuduj aplikację
RUN npm run build

# Expose port
EXPOSE 5000

# Zmienne środowiskowe
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Uruchom aplikację
CMD ["node", "dist/index.js"]