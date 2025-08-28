-- 🗄️ Skrypt inicjalizacji bazy danych dla OgłoSzybko
-- Ten plik jest uruchamiany automatycznie przy tworzeniu kontenera PostgreSQL

-- Utwórz rozszerzenia UUID (jeśli nie istnieją)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Utwórz indeksy dla lepszej wydajności wyszukiwania
-- Te będą dodane po utworzeniu tabel przez Drizzle

-- Skrypt wykona się automatycznie przy pierwszym uruchomieniu
COMMENT ON DATABASE ogloszybko_dev IS 'Baza danych aplikacji OgłoSzybko - ogłoszenia drobne';