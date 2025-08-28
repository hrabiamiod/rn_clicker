import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  MapPin, 
  Eye, 
  Heart, 
  Phone, 
  Mail, 
  Calendar,
  User,
  Shield
} from 'lucide-react';
import { ListingWithDetails } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';

export default function ListingDetail() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listing, isLoading, error } = useQuery<ListingWithDetails>({
    queryKey: ['/api/listings', id],
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/listings/${id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', id] });
      toast({
        title: listing?.isFavorited ? 'Usunięto z ulubionych' : 'Dodano do ulubionych',
        description: 'Twoje ulubione ogłoszenia znajdziesz w panelu użytkownika.',
      });
    },
    onError: () => {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować listy ulubionych.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Ogłoszenie nie znalezione</h1>
          <p className="text-muted-foreground mb-4">
            To ogłoszenie mogło zostać usunięte lub nie istnieje.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót na stronę główną
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do ogłoszeń
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="aspect-[16/9] relative rounded-lg overflow-hidden bg-muted">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0].imageUrl}
                alt={listing.images[0].altText || listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <p>Brak zdjęcia</p>
                </div>
              </div>
            )}
            
            {listing.isFeatured && (
              <Badge className="absolute top-4 left-4 bg-yellow-500">
                <Shield className="mr-1 h-3 w-3" />
                Wyróżnione
              </Badge>
            )}
          </div>

          {/* Title and Category */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold" data-testid="text-title">
                {listing.title}
              </h1>
              {user && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  data-testid="button-favorite"
                >
                  <Heart 
                    className={`h-4 w-4 ${listing.isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-muted-foreground mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-primary text-xl">{listing.category?.icon}</span>
                <span className="font-medium">{listing.category?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{listing.viewCount || 0} wyświetleń</span>
              </div>
            </div>

            {listing.price && (
              <div className="text-3xl font-bold text-primary mb-4" data-testid="text-price">
                {parseFloat(listing.price).toLocaleString('pl-PL')} zł
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Opis</h2>
            <div className="prose max-w-none" data-testid="text-description">
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Lokalizacja</h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span className="text-lg" data-testid="text-location">{listing.location}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Kontakt</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {listing.user?.firstName} {listing.user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">Sprzedawca</p>
                </div>
              </div>

              <Separator />

              {listing.contactPhone && (
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    data-testid="button-call"
                    asChild
                  >
                    <a href={`tel:${listing.contactPhone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Zadzwoń
                    </a>
                  </Button>
                </div>
              )}

              {listing.contactEmail && (
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    data-testid="button-email"
                    asChild
                  >
                    <a href={`mailto:${listing.contactEmail}?subject=${encodeURIComponent(`Pytanie o: ${listing.title}`)}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Wyślij email
                    </a>
                  </Button>
                </div>
              )}

              {!listing.contactPhone && !listing.contactEmail && (
                <p className="text-sm text-muted-foreground">
                  Brak informacji kontaktowych
                </p>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Szczegóły</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data dodania</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(listing.createdAt!), {
                      addSuffix: true,
                      locale: pl,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID ogłoszenia</span>
                <span className="font-mono text-sm">#{listing.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={listing.isApproved ? 'default' : 'secondary'}>
                  {listing.isApproved ? 'Aktywne' : 'W moderacji'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Safety Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-700">Bezpieczne ogłoszenie</p>
                  <p className="text-muted-foreground mt-1">
                    To ogłoszenie przeszło automatyczną moderację i zostało zweryfikowane przez nasze systemy bezpieczeństwa.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}