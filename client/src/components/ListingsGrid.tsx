import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Eye, Heart, Clock } from 'lucide-react';
import { ListingWithDetails } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Filters {
  categoryId?: number;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

interface ListingsGridProps {
  searchQuery: string;
  filters: Filters;
}

export default function ListingsGrid({ searchQuery, filters }: ListingsGridProps) {
  const queryParams = new URLSearchParams();
  
  if (searchQuery) queryParams.append('search', searchQuery);
  if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  if (filters.location) queryParams.append('location', filters.location);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  queryParams.append('sortBy', filters.sortBy);

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['/api/listings', queryParams.toString()],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/3]">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Wystąpił błąd podczas ładowania ogłoszeń. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Brak ogłoszeń</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filters.categoryId || filters.location
              ? 'Nie znaleziono ogłoszeń spełniających kryteria wyszukiwania.'
              : 'Nie ma jeszcze żadnych ogłoszeń. Bądź pierwszy!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing: ListingWithDetails) => (
        <Card
          key={listing.id}
          data-testid={`card-listing-${listing.id}`}
          className="overflow-hidden hover:shadow-lg transition-shadow group"
        >
          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0].imageUrl}
                alt={listing.images[0].altText || listing.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm">Brak zdjęcia</p>
                </div>
              </div>
            )}
            
            {listing.isFeatured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500">
                Wyróżnione
              </Badge>
            )}
          </div>

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center text-muted-foreground text-sm space-x-2">
              <span className="text-primary font-medium text-lg">
                {listing.category?.icon} {listing.category?.name}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pb-2">
            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
              {listing.description}
            </p>
            
            <div className="flex items-center text-muted-foreground text-sm space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{listing.location}</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <div className="flex items-center justify-between w-full">
              <div>
                {listing.price && (
                  <span className="font-bold text-lg text-primary">
                    {parseFloat(listing.price).toLocaleString('pl-PL')} zł
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-muted-foreground text-xs">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{listing.viewCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(listing.createdAt), {
                      addSuffix: true,
                      locale: pl,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Link href={`/listing/${listing.id}`} className="absolute inset-0" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}