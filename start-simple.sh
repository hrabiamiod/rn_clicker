#!/bin/bash

echo "🚀 Uruchamianie OgłoSzybko - Prosty tryb"

# Sprawdź czy node_modules istnieją
if [ ! -d "node_modules" ]; then
    echo "📦 Instaluję zależności..."
    npm install
fi

# Uruchom z prostą konfiguracją
echo "🔧 Uruchamianie z uproszczoną konfiguracją..."
npx vite --config vite.config.simple.ts --host 0.0.0.0 --port 5000

echo "✅ Aplikacja dostępna na http://localhost:5000"