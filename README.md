# 🚀 OgłoSzybko - Aplikacja Ogłoszeń Drobnych

Nowoczesna, bezpieczna aplikacja do publikowania ogłoszeń drobnych w języku polskim z automatyczną moderacją treści i piękną animacją interfejsu.

## ✨ Funkcjonalności

- 📝 **Łatwe dodawanie ogłoszeń** - Intuicyjny formularz z walidacją
- 🔒 **Bezpieczeństwo** - Automatyczna moderacja treści, ochrona przed spamem
- 🎨 **Piękny interfejs** - Animacje i mikro-interakcje dla lepszego UX
- 📱 **Responsywny design** - Działa na wszystkich urządzeniach
- ⚡ **Szybka publikacja** - Ogłoszenia są weryfikowane i publikowane automatycznie
- 🗂️ **Kategorie** - Uporządkowane kategorie dla różnych typów ogłoszeń

## 🛠️ Technologie

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, TypeScript
- **Baza danych:** PostgreSQL z Drizzle ORM
- **Animacje:** Framer Motion
- **Komponenty UI:** Radix UI + shadcn/ui
- **Walidacja:** Zod
- **Sesje:** Express Session

## 📋 Wymagania

- Node.js 18+ 
- PostgreSQL 14+
- npm lub yarn

## 🚀 Szybkie uruchomienie

### 1. Sklonuj repozytorium
```bash
git clone <url-repozytorium>
cd ogloszybko
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Skonfiguruj bazę danych
```bash
# Utwórz bazę danych PostgreSQL
createdb ogloszybko_dev

# Skopiuj plik konfiguracyjny
cp .env.example .env
```

### 4. Uzupełnij zmienne środowiskowe w pliku `.env`
```bash
# Baza danych
DATABASE_URL="postgresql://username:password@localhost:5432/ogloszybko_dev"
PGHOST=localhost
PGPORT=5432
PGDATABASE=ogloszybko_dev
PGUSER=your_username
PGPASSWORD=your_password

# Sesje (wygeneruj losowy ciąg znaków)
SESSION_SECRET="twoj-bardzo-bezpieczny-sekret-sesji"

# Środowisko
NODE_ENV=development

# OpenAI
OPENAI_API_KEY="twoj_klucz_api_openai"
```

### 5. Zainicjalizuj bazę danych
```bash
npm run db:push
```

### 6. Uruchom aplikację
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:5000

## 📁 Struktura projektu

```
ogloszybko/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/     # Komponenty UI
│   │   ├── pages/          # Strony aplikacji
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Backend (Express)
│   ├── routes.ts           # Endpointy API
│   ├── storage.ts          # Warstwa dostępu do danych
│   └── index.ts            # Główny plik serwera
├── shared/                 # Wspólne typy i schematy
│   └── schema.ts           # Schemat bazy danych (Drizzle)
└── package.json
```

## 🗄️ Schemat bazy danych

Aplikacja korzysta z następujących tabel:
- **users** - Użytkownicy systemu
- **categories** - Kategorie ogłoszeń
- **listings** - Ogłoszenia
- **images** - Zdjęcia do ogłoszeń
- **analytics** - Statystyki wyświetleń

## 🔧 Komendy

```bash
# Rozwój
npm run dev          # Uruchom serwer deweloperski
npm run build        # Zbuduj aplikację do produkcji
npm run start        # Uruchom aplikację produkcyjną

# Baza danych
npm run db:push      # Zaktualizuj schemat bazy danych
npm run check        # Sprawdź typy TypeScript
```

## 🔒 Bezpieczeństwo

Aplikacja zawiera zaawansowane funkcje bezpieczeństwa:

- **Rate limiting** - Ograniczenie liczby zapytań
- **Walidacja danych** - Wszystkie dane są walidowane na froncie i backendzie
- **Ochrona sesji** - Bezpieczne zarządzanie sesjami użytkowników
- **Automatyczna moderacja** - System weryfikacji treści
- **Ochrona przed atakami** - Helmet.js, CSRF protection

## 🎨 Interfejs użytkownika

Aplikacja oferuje:
- Piękne animacje przejść między stanami
- Mikro-interakcje przy przesyłaniu formularzy
- Responsywny design działający na wszystkich urządzeniach
- Tryb ciemny/jasny
- Intuicyjną nawigację

## 📝 API

Główne endpointy:

```
GET    /api/listings        # Lista ogłoszeń
POST   /api/listings        # Dodaj ogłoszenie
GET    /api/listings/:id    # Szczegóły ogłoszenia
GET    /api/categories      # Lista kategorii
POST   /api/auth/register   # Rejestracja
POST   /api/auth/login      # Logowanie
```

## 🚀 Deployment

### Produkcja z Docker

1. Zbuduj aplikację:
```bash
npm run build
```

2. Uruchom z Docker Compose:
```bash
docker-compose up -d
```

### Deployment na serwerze

1. Skopiuj pliki na serwer
2. Zainstaluj zależności produkcyjne: `npm ci --production`
3. Zbuduj aplikację: `npm run build`
4. Skonfiguruj zmienne środowiskowe produkcyjne
5. Uruchom: `npm start`

## 🤝 Wsparcie

Jeśli napotkasz problemy:

1. Sprawdź, czy wszystkie zależności są zainstalowane
2. Upewnij się, że PostgreSQL działa i połączenie jest poprawne
3. Zweryfikuj zmienne środowiskowe w pliku `.env`
4. Sprawdź logi aplikacji: `npm run dev`

## 📄 Licencja

MIT License - możesz swobodnie używać i modyfikować tę aplikację.

---

**Powodzenia z aplikacją OgłoSzybko! 🎉**