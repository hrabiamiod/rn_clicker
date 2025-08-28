import { useState } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import ListingsGrid from '@/components/ListingsGrid';
import Footer from '@/components/Footer';
import AddListingModal from '@/components/AddListingModal';

interface Filters {
  categoryId?: number;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

export default function Home() {
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    categoryId: undefined,
    location: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'newest',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddListingClick={() => setShowAddListingModal(true)}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CategoryFilter
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <ListingsGrid
          searchQuery={searchQuery}
          filters={filters}
        />
      </main>

      <Footer />

      {showAddListingModal && (
        <AddListingModal
          isOpen={showAddListingModal}
          onClose={() => setShowAddListingModal(false)}
        />
      )}
    </div>
  );
}
