#!/bin/bash

echo "🚀 Uruchamianie OgłoSzybko..."

# Sprawdź czy baza danych działa
echo "📊 Sprawdzanie bazy danych..."
npm run db:push

# Uruchom serwer
echo "⚡ Uruchamianie serwera na porcie 5000..."
NODE_ENV=development tsx server/index.ts