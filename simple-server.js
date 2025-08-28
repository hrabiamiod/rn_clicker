// Prosty serwer Express bez problematycznych konfiguracji
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Statyczne pliki
app.use(express.static('dist'));

// Wszystkie routes przekierowaj do index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OgłoSzybko działa na porcie ${PORT}`);
  console.log(`📱 Otwórz: http://localhost:${PORT}`);
});