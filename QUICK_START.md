# 🚀 Szybkie Uruchomienie OgłoSzybko

## Lokalne uruchomienie (NAJPROSTE)

### 1. Pobierz kod
- Kliknij **trzy kropki** (⋯) w Replit → **Download as ZIP**
- Rozpakuj folder na swoim komputerze

### 2. Przygotuj środowisko
```bash
cd ogloszybko
npm install
```

### 3. Skonfiguruj bazę danych
```bash
# Skopiuj konfigurację
cp .env.example .env

# Edytuj .env i ustaw swoje dane PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/ogloszybko_dev"
# SESSION_SECRET="your-secure-secret-at-least-32-chars"
```

### 4. Zainicjalizuj bazę
```bash
# Utwórz bazę danych (przykład dla PostgreSQL)
createdb ogloszybko_dev

# Zsynchronizuj schemat
npm run db:push
```

### 5. Uruchom aplikację
```bash
# OPCJA A: Bezpośrednio
npm run dev

# OPCJA B: Za pomocą skryptu
./start.sh

# OPCJA C: Docker (jeśli masz Docker)
docker-compose up -d
```

## ✅ Sprawdź czy działa
Otwórz: http://localhost:5000

Powinieneś zobaczyć:
- 🏠 Stronę główną z kategoriami
- ➕ Możliwość dodawania ogłoszeń
- ✨ Piękne animacje przy przesyłaniu formularzy

## 🔧 Rozwiązywanie problemów

### Port zajęty?
```bash
# Zabij proces na porcie 5000
pkill -f "tsx server"
# lub
kill $(lsof -ti:5000)
```

### Błędy bazy danych?
```bash
# Sprawdź czy PostgreSQL działa
sudo systemctl status postgresql

# Wymuś synchronizację schematu
npm run db:push -- --force
```

### Docker nie działa?
```bash
# Zatrzymaj wszystko
docker-compose down

# Usuń stare obrazy
docker system prune -a

# Uruchom ponownie
docker-compose up --build
```

## 📞 Jeśli nic nie działa
Napisz jakie dokładnie widzisz błędy - naprawię kod natychmiast!

---
**OgłoSzybko - Twoja aplikacja ogłoszeń gotowa w 5 minut! 🎉**