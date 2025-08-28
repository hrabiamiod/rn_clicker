const express = require('express');
const { Parcel } = require('@parcel/core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Konfiguracja Parcel
    const bundler = new Parcel({
      entries: path.join(__dirname, 'client/index.html'),
      defaultConfig: '@parcel/config-default',
      mode: 'development',
      targets: {
        default: {
          distDir: path.join(__dirname, 'dist-parcel'),
          publicUrl: '/'
        }
      },
      hmr: {
        port: 3001
      }
    });

    // Uruchom Parcel w trybie watch
    console.log('🔧 Uruchamianie Parcel bundler...');
    await bundler.watch((err, event) => {
      if (err) {
        console.error('❌ Błąd Parcel:', err);
        return;
      }
      if (event) {
        console.log('✅ Parcel: Pliki zaktualizowane');
      }
    });

    // Serwuj statyczne pliki z dist-parcel
    app.use(express.static(path.join(__dirname, 'dist-parcel')));

    // API routes (dodaj tutaj swoje API endpoints)
    app.use('/api', (req, res) => {
      res.json({ message: 'API działa!' });
    });

    // Wszystkie inne routes przekieruj do index.html (SPA)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist-parcel', 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 OgłoSzybko działa na Parcel!');
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔥 HMR: http://localhost:3001`);
      console.log('✅ Bez problemów z React Vite!');
    });

  } catch (error) {
    console.error('❌ Błąd uruchomienia serwera:', error);
    process.exit(1);
  }
}

startServer();