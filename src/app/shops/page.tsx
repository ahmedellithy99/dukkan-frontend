'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketplaceStore } from '@/store/marketplace';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShopCard } from '@/components/ShopCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, X } from 'lucide-react';
import { mockData } from '@/lib/api';

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const subsubcategory = searchParams.get('subsubcategory');
  const search = searchParams.get('search');

  const {
    shops,
    selectedCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    setShops,
    setSelectedCategory,
    setSelectedSubCategory,
    setSelectedSubSubCategory,
    setIsLoading,
    setError,
  } = useMarketplaceStore();

  const [isLoading, setIsLoadingState] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingState(true);
      setError(null);

      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setShops(mockData.shops);
      } catch (err) {
        setErrorState('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoadingState(false);
      }
    };

    loadData();
  }, [setShops, setIsLoading, setError]);

  // Sync URL params with store state
  useEffect(() => {
    setSelectedCategory(category as any || null);
    setSelectedSubCategory(subcategory || null);
    setSelectedSubSubCategory(subsubcategory || null);
  }, [category, subcategory, subsubcategory, setSelectedCategory, setSelectedSubCategory, setSelectedSubSubCategory]);

  // Categories data
  const categories = [
    {
      id: 'clothes',
      name: 'Clothes',
      icon: '👕',
    },
    {
      id: 'shoes',
      name: 'Shoes',
      icon: '👟',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: '⌚',
    },
    {
      id: 'cosmetics',
      name: 'Cosmetics',
      icon: '💄',
    },
    {
      id: 'toys',
      name: 'Toys',
      icon: '🧸',
    },
    {
      id: 'phones',
      name: 'Phones',
      icon: '📱',
    },
    {
      id: 'laptops',
      name: 'Laptops',
      icon: '💻',
    },
  ];

  // Filter shops by category and search query
  const filteredShops = shops.filter(shop => {
    const matchesCategory = !selectedCategory || shop.category === selectedCategory;
    const matchesSearch = !search ||
      shop.name.toLowerCase().includes(search.toLowerCase()) ||
      shop.description.toLowerCase().includes(search.toLowerCase()) ||
      shop.address.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryDisplayName = () => {
    if (selectedSubSubCategory) {
      return selectedSubSubCategory;
    }
    if (selectedSubCategory) {
      return selectedSubCategory;
    }
    return selectedCategory || '';
  };

  // Loading skeleton component
  const ShopSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">
          {search ? `Search Results for "${search}"` : getCategoryDisplayName() || 'All Shops'}
        </h1>
        <p className="text-muted-foreground">
          {search
            ? `Found ${filteredShops.length} shop${filteredShops.length !== 1 ? 's' : ''} matching your search`
            : `Discover amazing ${getCategoryDisplayName().toLowerCase()} stores in Abu Hommos`
          }
        </p>
        {search && (
          <Button
            variant="ghost"
            className="mt-2 gap-2"
            onClick={() => window.history.pushState({}, '', '/shops')}
          >
            <X className="h-4 w-4" />
            Clear search
          </Button>
        )}
        {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
          <Button
            variant="ghost"
            className="mt-2 gap-2"
            onClick={() => window.history.pushState({}, '', '/shops')}
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => window.history.pushState({}, '', '/shops')}
        >
          All Categories
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => window.history.pushState({}, '', `/shops?category=${cat.id}`)}
            className="gap-2"
          >
            <span>{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Shops Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ShopSkeleton />
          <ShopSkeleton />
          <ShopSkeleton />
          <ShopSkeleton />
          <ShopSkeleton />
          <ShopSkeleton />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredShops.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Shops Found</h3>
            <p className="text-muted-foreground">
              {selectedCategory
                ? `No shops found in ${selectedCategory} category.`
                : 'No shops available at the moment.'}
            </p>
            {selectedCategory && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.history.pushState({}, '', '/shops')}
              >
                View All Categories
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
