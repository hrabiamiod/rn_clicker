# 📦 Instrukcje Wdrażania OgłoSzybko

## 🚀 Opcja 1: Szybkie uruchomienie z Docker

### Wymagania
- Docker i Docker Compose
- Git

### Kroki
1. **Sklonuj repozytorium**
```bash
git clone <url-repozytorium>
cd ogloszybko
```

2. **Uruchom całą aplikację jedną komendą**
```bash
docker-compose up -d
```

3. **Sprawdź status**
```bash
docker-compose ps
```

4. **Aplikacja dostępna pod adresami:**
- **Aplikacja główna:** http://localhost:5000
- **pgAdmin (zarządzanie bazą):** http://localhost:8080
  - Email: admin@ogloszybko.pl
  - Hasło: admin123

### Zarządzanie kontenerami
```bash
# Zatrzymaj aplikację
docker-compose down

# Zatrzymaj i usuń dane
docker-compose down -v

# Odbuduj aplikację po zmianach
docker-compose up --build -d

# Sprawdź logi
docker-compose logs -f app
```

## 🔧 Opcja 2: Instalacja lokalna

### Wymagania
- Node.js 18+
- PostgreSQL 14+
- npm lub yarn

### 1. Przygotowanie środowiska

```bash
# Sklonuj repozytorium
git clone <url-repozytorium>
cd ogloszybko

# Zainstaluj zależności
npm install

# Skopiuj konfigurację
cp .env.example .env
```

### 2. Konfiguracja bazy danych

**PostgreSQL - instalacja na Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Utwórz bazę i użytkownika
sudo -u postgres createuser --interactive ogloszybko
sudo -u postgres createdb ogloszybko_dev -O ogloszybko
sudo -u postgres psql -c "ALTER USER ogloszybko PASSWORD 'your_password';"
```

**PostgreSQL - instalacja na macOS:**
```bash
brew install postgresql
brew services start postgresql

# Utwórz bazę
createdb ogloszybko_dev
```

**PostgreSQL - instalacja na Windows:**
- Pobierz PostgreSQL z https://www.postgresql.org/download/windows/
- Zainstaluj używając instalatora
- Użyj pgAdmin do utworzenia bazy `ogloszybko_dev`

### 3. Konfiguracja zmiennych środowiskowych

Edytuj plik `.env`:

```bash
# Przykład dla lokalnej PostgreSQL
DATABASE_URL="postgresql://ogloszybko:your_password@localhost:5432/ogloszybko_dev"
PGHOST=localhost
PGPORT=5432
PGDATABASE=ogloszybko_dev
PGUSER=ogloszybko
PGPASSWORD=your_password

# Wygeneruj silny sekret sesji
SESSION_SECRET="your-very-secure-session-secret-at-least-32-characters"

NODE_ENV=development
```

### 4. Inicjalizacja i uruchomienie

```bash
# Zainicjalizuj schemat bazy danych
npm run db:push

# Uruchom serwer deweloperski
npm run dev
```

Aplikacja będzie dostępna pod: http://localhost:5000

## 🌐 Opcja 3: Wdrożenie produkcyjne

### VPS/Serwer dedykowany

1. **Przygotuj serwer**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm postgresql nginx certbot python3-certbot-nginx git -y

# Utwórz użytkownika aplikacji
sudo adduser ogloszybko
sudo usermod -aG sudo ogloszybko
su - ogloszybko
```

2. **Sklonuj i skonfiguruj aplikację**
```bash
git clone <url> /home/ogloszybko/app
cd /home/ogloszybko/app
npm ci --production
cp .env.example .env
# Edytuj .env z produkcyjnymi danymi
npm run build
```

3. **Konfiguracja Nginx**
```nginx
# /etc/nginx/sites-available/ogloszybko
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Aktywacja i SSL**
```bash
sudo ln -s /etc/nginx/sites-available/ogloszybko /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com
```

5. **Systemd Service**
```bash
# /etc/systemd/system/ogloszybko.service
[Unit]
Description=OgłoSzybko App
After=network.target

[Service]
Type=simple
User=ogloszybko
WorkingDirectory=/home/ogloszybko/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ogloszybko
sudo systemctl start ogloszybko
```

### Heroku

1. **Przygotuj aplikację**
```bash
# Zainstaluj Heroku CLI
# Dodaj Procfile
echo "web: npm start" > Procfile
```

2. **Deploy**
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0
git push heroku main
heroku run npm run db:push
```

## 🔍 Rozwiązywanie problemów

### Typowe błędy

1. **Błąd połączenia z bazą danych**
```bash
# Sprawdź status PostgreSQL
sudo systemctl status postgresql

# Sprawdź połączenie
psql $DATABASE_URL
```

2. **Port już zajęty**
```bash
# Znajdź proces na porcie 5000
lsof -ti:5000
kill $(lsof -ti:5000)
```

3. **Brak uprawnień do plików**
```bash
sudo chown -R ogloszybko:ogloszybko /home/ogloszybko/app
chmod +x /home/ogloszybko/app/dist/index.js
```

4. **Problemy z npm**
```bash
# Wyczyść cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Logi i monitoring

```bash
# Logi aplikacji (systemd)
sudo journalctl -u ogloszybko -f

# Logi Nginx
sudo tail -f /var/log/nginx/error.log

# Sprawdź status procesów
sudo systemctl status ogloszybko postgresql nginx
```

## 📊 Kopie zapasowe

### Automatyczna kopia bazy danych
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
# Prześlij na S3 lub inne miejsce
```

### Przywracanie z kopii
```bash
psql $DATABASE_URL < backup_20240101_120000.sql
```

## 🔐 Bezpieczeństwo produkcyjne

1. **Firewall**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

2. **Aktualizacje automatyczne**
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

3. **Monitoring**
- Zainstaluj fail2ban
- Skonfiguruj monitoring z Prometheus/Grafana
- Ustaw alerty emailowe

---

**Powodzenia z wdrożeniem! 🎉**

W razie problemów sprawdź logi i skontaktuj się z dokumentacją PostgreSQL/Node.js.