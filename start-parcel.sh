#!/bin/bash

echo "🚀 Uruchamianie OgłoSzybko z Parcel (bez problematycznego Vite React)"

# Sprawdź czy node_modules istnieją
if [ ! -d "node_modules" ]; then
    echo "📦 Instaluję zależności..."
    npm install
fi

# Usuń stary dist jeśli istnieje
if [ -d "dist-parcel" ]; then
    echo "🧹 Czyszczę poprzedni build..."
    rm -rf dist-parcel
fi

echo "🔧 Uruchamianie z Parcel bundler..."

# Uruchom Parcel bezpośrednio
npx parcel client/index.html --dist-dir dist-parcel --port 5000 --host 0.0.0.0 --no-cache

echo "✅ OgłoSzybko dostępne na http://localhost:5000"