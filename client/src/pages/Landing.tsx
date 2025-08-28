import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Search, Users, Star, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">OgłoSzybko</span>
            </div>
            
            <Button 
              data-testid="button-login"
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Zaloguj się
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Najszybsza platforma ogłoszeń w Polsce
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dodaj ogłoszenie w mniej niż minutę!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nowoczesna, bezpieczna platforma z AI moderacją, zaawansowanymi filtrami 
              i kompleksowym zarządzaniem użytkownikami.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                data-testid="button-get-started"
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = '/api/login'}
              >
                <Zap className="w-5 h-5 mr-2" />
                Rozpocznij za darmo
              </Button>
              
              <Button 
                data-testid="button-browse-listings"
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="w-5 h-5 mr-2" />
                Przeglądaj ogłoszenia
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Dlaczego OgłoSzybko?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wykorzystujemy najnowocześniejsze technologie, aby zapewnić Ci bezpieczne 
              i wygodne doświadczenie sprzedaży i zakupów.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Moderacja</h3>
                <p className="text-muted-foreground">
                  Zaawansowana sztuczna inteligencja automatycznie sprawdza ogłoszenia, 
                  zapewniając bezpieczeństwo i jakość treści.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Błyskawiczna prędkość</h3>
                <p className="text-muted-foreground">
                  Zoptymalizowana platforma zapewnia szybkie ładowanie nawet przy 
                  dużej liczbie ogłoszeń. Dodaj ogłoszenie w kilka sekund.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Zaawansowane filtry</h3>
                <p className="text-muted-foreground">
                  Potężne filtry po lokalizacji, cenie, dacie i kategorii. 
                  Znajdź dokładnie to, czego szukasz.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Zarządzanie kontem</h3>
                <p className="text-muted-foreground">
                  Kompleksowy panel użytkownika z możliwością zmiany hasła, 
                  dwustopniową weryfikacją i zarządzaniem ogłoszeniami.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analityka w czasie rzeczywistym</h3>
                <p className="text-muted-foreground">
                  Śledź wyświetlenia swoich ogłoszeń, zainteresowanie w czasie 
                  i otrzymuj szczegółowe statystyki.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">W pełni darmowe</h3>
                <p className="text-muted-foreground">
                  Platforma jest całkowicie bezpłatna. Bez ukrytych opłat, 
                  bez limitów ogłoszeń, bez subskrypcji.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Popularne kategorie</h2>
            <p className="text-muted-foreground">
              Znajdź to, czego szukasz w naszych najpopularniejszych kategoriach
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Motoryzacja', icon: '🚗', count: '1,234' },
              { name: 'Nieruchomości', icon: '🏠', count: '856' },
              { name: 'Elektronika', icon: '💻', count: '2,045' },
              { name: 'Moda', icon: '👕', count: '678' },
              { name: 'Dom i Ogród', icon: '🛋️', count: '934' },
              { name: 'Praca', icon: '💼', count: '445' },
              { name: 'Usługi', icon: '🔧', count: '567' },
              { name: 'Sport i Hobby', icon: '⚽', count: '321' },
              { name: 'Kolekcje', icon: '💎', count: '123' },
              { name: 'Zwierzęta', icon: '🐾', count: '234' },
            ].map((category, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Gotowy na rozpoczęcie?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Dołącz do tysięcy użytkowników, którzy już korzystają z OgłoSzybko. 
            Dodaj swoje pierwsze ogłoszenie już dziś!
          </p>
          <Button 
            data-testid="button-join-now"
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
          >
            <Zap className="w-5 h-5 mr-2" />
            Dołącz teraz za darmo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">OgłoSzybko</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Najszybsza platforma ogłoszeń w Polsce. Dodaj ogłoszenie w mniej niż minutę!
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Dla użytkowników</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Jak dodać ogłoszenie</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Bezpieczeństwo</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pomoc</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Kontakt</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Informacje</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">O nas</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Regulamin</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Polityka prywatności</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 OgłoSzybko. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
