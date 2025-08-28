import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-xl font-bold text-primary">
              OgłoSzybko
            </div>
            <p className="text-muted-foreground text-sm">
              Najszybszy sposób na sprzedaż i kupno w Twojej okolicy. 
              Bezpieczne ogłoszenia z automatyczną moderacją.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Szybkie linki</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-muted-foreground hover:text-primary">
                Strona główna
              </Link>
              <Link href="/dashboard" className="block text-muted-foreground hover:text-primary">
                Moje ogłoszenia
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Popularne kategorie</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>🚗 Motoryzacja</div>
              <div>🏠 Nieruchomości</div>
              <div>💻 Elektronika</div>
              <div>👕 Moda</div>
            </div>
          </div>

          {/* Safety */}
          <div className="space-y-4">
            <h3 className="font-semibold">Bezpieczeństwo</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>🛡️ Automatyczna moderacja</div>
              <div>🔍 Weryfikacja treści</div>
              <div>⚡ Szybka publikacja</div>
              <div>📞 Bezpieczny kontakt</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
          <p>&copy; 2024 OgłoSzybko. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}