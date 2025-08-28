import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  DollarSign,
  Shield,
  Heart
} from 'lucide-react';
import { ListingWithDetails } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import AddListingModal from '@/components/AddListingModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings/me'],
    enabled: !!user,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (listingId: number) => 
      apiRequest(`/api/listings/${listingId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: 'Ogłoszenie usunięte',
        description: 'Twoje ogłoszenie zostało pomyślnie usunięte.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/me'] });
    },
    onError: () => {
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć ogłoszenia. Spróbuj ponownie.',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Zaloguj się</h1>
          <p className="text-muted-foreground mb-4">
            Musisz być zalogowany, aby zobaczyć swój dashboard.
          </p>
          <Link href="/">
            <Button>Powrót na stronę główną</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ListingCard = ({ listing }: { listing: ListingWithDetails }) => (
    <Card key={listing.id} data-testid={`card-my-listing-${listing.id}`} className="overflow-hidden">
      <div className="aspect-[4/3] relative bg-muted">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0].imageUrl}
            alt={listing.images[0].altText || listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">Brak zdjęcia</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex space-x-1">
          {listing.isFeatured && (
            <Badge className="bg-yellow-500">Wyróżnione</Badge>
          )}
          <Badge variant={listing.isApproved ? 'default' : 'secondary'}>
            {listing.isApproved ? 'Aktywne' : 'W moderacji'}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <Eye className="h-3 w-3" />
            <span>{listing.viewCount || 0}</span>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground text-sm space-x-2">
          <span className="text-primary">{listing.category?.icon} {listing.category?.name}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {listing.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {listing.price && (
              <div className="font-bold text-primary">
                {parseFloat(listing.price).toLocaleString('pl-PL')} zł
              </div>
            )}
            <div className="flex items-center text-muted-foreground text-xs space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center text-muted-foreground text-xs space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(listing.createdAt), {
                  addSuffix: true,
                  locale: pl,
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Link href={`/listing/${listing.id}`}>
              <Button size="sm" variant="outline" data-testid={`button-view-${listing.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Zobacz
              </Button>
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  data-testid={`button-delete-${listing.id}`}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Usuń
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy na pewno usunąć ogłoszenie?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ta akcja jest nieodwracalna. Ogłoszenie "{listing.title}" zostanie trwale usunięte.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteMutation.mutate(listing.id)}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Usuń ogłoszenie
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Witaj, {user.firstName} {user.lastName}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-listing">
          <Plus className="mr-2 h-4 w-4" />
          Dodaj ogłoszenie
        </Button>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="listings" data-testid="tab-listings">
            Moje ogłoszenia ({myListings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="favorites" data-testid="tab-favorites">
            <Heart className="mr-1 h-3 w-3" />
            Ulubione ({favorites?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-6">
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myListings?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((listing: ListingWithDetails) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">Nie masz jeszcze ogłoszeń</h3>
              <p className="text-muted-foreground mb-4">
                Dodaj swoje pierwsze ogłoszenie i zacznij sprzedawać!
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj ogłoszenie
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          {favoritesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favorites?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((listing: ListingWithDetails) => (
                <Card key={listing.id} data-testid={`card-favorite-${listing.id}`} className="overflow-hidden">
                  <Link href={`/listing/${listing.id}`} className="block">
                    <div className="aspect-[4/3] relative bg-muted">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0].imageUrl}
                          alt={listing.images[0].altText || listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📷</div>
                            <p className="text-sm">Brak zdjęcia</p>
                          </div>
                        </div>
                      )}
                      
                      <Heart className="absolute top-2 right-2 h-5 w-5 fill-red-500 text-red-500" />
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                      <div className="flex items-center text-muted-foreground text-sm space-x-2">
                        <span className="text-primary">{listing.category?.icon} {listing.category?.name}</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {listing.price && (
                          <div className="font-bold text-primary">
                            {parseFloat(listing.price).toLocaleString('pl-PL')} zł
                          </div>
                        )}
                        <div className="flex items-center text-muted-foreground text-xs space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💖</div>
              <h3 className="text-lg font-semibold mb-2">Brak ulubionych ogłoszeń</h3>
              <p className="text-muted-foreground mb-4">
                Dodaj ogłoszenia do ulubionych, klikając ikonę serca.
              </p>
              <Link href="/">
                <Button>Przeglądaj ogłoszenia</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Listing Modal */}
      <AddListingModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}