import { useState } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import ListingsGrid from '@/components/ListingsGrid';
import Footer from '@/components/Footer';
import AddListingModal from '@/components/AddListingModal';

export default function Home() {
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    location: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'newest' as 'newest' | 'oldest' | 'price_asc' | 'price_desc',
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
