const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Konfiguracja esbuild dla React/TypeScript
const buildConfig = {
  entryPoints: ['client/src/main.tsx'],
  bundle: true,
  outfile: 'dist-esbuild/bundle.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  jsxDev: false,
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.gif': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.eot': 'file'
  },
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  alias: {
    '@': path.resolve('./client/src'),
    '@shared': path.resolve('./shared'),
    '@assets': path.resolve('./attached_assets')
  },
  sourcemap: true,
  minify: false
};

async function build() {
  try {
    // Utwórz folder dist-esbuild
    if (!fs.existsSync('dist-esbuild')) {
      fs.mkdirSync('dist-esbuild', { recursive: true });
    }

    // Build z esbuild
    console.log('🔧 Budowanie z esbuild...');
    await esbuild.build(buildConfig);
    
    // Skopiuj index.html i zmień ścieżkę do bundle
    const htmlContent = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OgłoSzybko - Najszybsze ogłoszenia w Polsce</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="bundle.js"></script>
</body>
</html>`;

    fs.writeFileSync('dist-esbuild/index.html', htmlContent);
    
    // Skopiuj CSS
    if (fs.existsSync('client/src/index.css')) {
      fs.copyFileSync('client/src/index.css', 'dist-esbuild/style.css');
    }

    console.log('✅ Build ukończony pomyślnie!');
    
  } catch (error) {
    console.error('❌ Błąd budowania:', error);
    process.exit(1);
  }
}

// Funkcja watch dla development
async function watch() {
  try {
    console.log('👀 Uruchamianie watch mode...');
    
    const ctx = await esbuild.context({
      ...buildConfig,
      plugins: [{
        name: 'rebuild-notify',
        setup(build) {
          build.onEnd(() => {
            console.log('🔄 Przebudowano!');
          });
        }
      }]
    });

    await ctx.watch();
    console.log('⚡ Watch mode aktywny!');
    
    // Nie zamykaj procesu
    return ctx;
    
  } catch (error) {
    console.error('❌ Błąd watch mode:', error);
    process.exit(1);
  }
}

// Export funkcji
module.exports = { build, watch };

// Uruchom jeśli wywoływany bezpośrednio
if (require.main === module) {
  const mode = process.argv[2];
  if (mode === 'watch') {
    watch();
  } else {
    build();
  }
}