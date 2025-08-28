import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, DollarSign, Filter } from 'lucide-react';
import { CategoryWithCount } from '@shared/schema';

interface Filters {
  categoryId?: number;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

interface CategoryFilterProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function CategoryFilter({ filters, onFiltersChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ['/api/categories'],
    enabled: true,
  });

  const handleCategorySelect = (categoryId?: number) => {
    onFiltersChange({
      ...filters,
      categoryId,
    });
  };

  const handleLocationChange = (location: string) => {
    onFiltersChange({
      ...filters,
      location,
    });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc') => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      categoryId: undefined,
      location: '',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'newest',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 py-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const hasActiveFilters = filters.categoryId || filters.location || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Filtry</h3>
        {hasActiveFilters && (
          <Button
            data-testid="button-clear-filters"
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            Wyczyść filtry
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categories */}
        <div className="space-y-2">
          <Label>Kategoria</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              data-testid="button-category-all"
              variant={!filters.categoryId ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(undefined)}
            >
              Wszystkie
            </Button>
            {(categories || []).map((category: CategoryWithCount) => (
              <Button
                key={category.id}
                data-testid={`button-category-${category.id}`}
                variant={filters.categoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category.id)}
                className="flex items-center space-x-1"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {category.listingCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Lokalizacja</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="location"
              data-testid="input-location"
              placeholder="Miasto, województwo..."
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Zakres cen</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                data-testid="input-min-price"
                placeholder="Od"
                type="number"
                min="0"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                data-testid="input-max-price"
                placeholder="Do"
                type="number"
                min="0"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sortowanie</Label>
          <Select
            value={filters.sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Najnowsze</SelectItem>
              <SelectItem value="oldest">Najstarsze</SelectItem>
              <SelectItem value="price_asc">Cena: od najniższej</SelectItem>
              <SelectItem value="price_desc">Cena: od najwyższej</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}