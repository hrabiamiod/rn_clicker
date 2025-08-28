#!/bin/bash

echo "🚀 Uruchamianie OgłoSzybko z esbuild (bez problematycznego Vite React)"

# Sprawdź czy node_modules istnieją
if [ ! -d "node_modules" ]; then
    echo "📦 Instaluję zależności..."
    npm install
fi

# Usuń stary dist jeśli istnieje
if [ -d "dist-esbuild" ]; then
    echo "🧹 Czyszczę poprzedni build..."
    rm -rf dist-esbuild
fi

echo "🔧 Budowanie z esbuild..."
node build-esbuild.cjs

if [ $? -eq 0 ]; then
    echo "✅ Build ukończony!"
    echo "🌐 Uruchamianie live-server..."
    npx live-server dist-esbuild --host=0.0.0.0 --port=5000 --cors --no-browser
else
    echo "❌ Błąd budowania!"
    exit 1
fi