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

  // Categories data with subcategories
  const categories = [
    {
      id: 'clothes',
      name: 'Clothes',
      icon: '👕',
      subCategories: [
        {
          id: 'men',
          name: 'Men',
          icon: '👨',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'classic', name: 'Classic' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'women',
          name: 'Women',
          icon: '👩',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'classic', name: 'Classic' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'kids',
          name: 'Kids',
          icon: '👶',
          subSubCategories: [
            { id: 'boys', name: 'Boys' },
            { id: 'girls', name: 'Girls' },
          ],
        },
      ],
    },
    {
      id: 'shoes',
      name: 'Shoes',
      icon: '👟',
      subCategories: [
        {
          id: 'men',
          name: 'Men',
          icon: '👨',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'women',
          name: 'Women',
          icon: '👩',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'kids',
          name: 'Kids',
          icon: '👶',
          subSubCategories: [
            { id: 'boys', name: 'Boys' },
            { id: 'girls', name: 'Girls' },
          ],
        },
      ],
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: '⌚',
      subCategories: [
        {
          id: 'men',
          name: 'Men',
          icon: '👨',
          subSubCategories: [
            { id: 'watches', name: 'Watches' },
            { id: 'belts', name: 'Belts' },
            { id: 'glasses', name: 'Glasses' },
          ],
        },
        {
          id: 'women',
          name: 'Women',
          icon: '👩',
          subSubCategories: [
            { id: 'watches', name: 'Watches' },
            { id: 'jewelry', name: 'Jewelry' },
            { id: 'bags', name: 'Bags' },
          ],
        },
      ],
    },
    {
      id: 'cosmetics',
      name: 'Cosmetics',
      icon: '💄',
      subCategories: [
        {
          id: 'makeup',
          name: 'Makeup',
          icon: '💄',
          subSubCategories: [
            { id: 'face', name: 'Face' },
            { id: 'eyes', name: 'Eyes' },
            { id: 'lips', name: 'Lips' },
          ],
        },
        {
          id: 'skincare',
          name: 'Skincare',
          icon: '🧴',
          subSubCategories: [
            { id: 'face', name: 'Face' },
            { id: 'body', name: 'Body' },
          ],
        },
      ],
    },
    {
      id: 'toys',
      name: 'Toys',
      icon: '🧸',
      subCategories: [
        {
          id: 'educational',
          name: 'Educational',
          icon: '📚',
          subSubCategories: [
            { id: 'puzzles', name: 'Puzzles' },
            { id: 'games', name: 'Games' },
          ],
        },
        {
          id: 'action',
          name: 'Action Figures',
          icon: '🦸',
          subSubCategories: [
            { id: 'superheroes', name: 'Superheroes' },
            { id: 'collectibles', name: 'Collectibles' },
          ],
        },
      ],
    },
    {
      id: 'phones',
      name: 'Phones',
      icon: '📱',
      subCategories: [
        {
          id: 'smartphones',
          name: 'Smartphones',
          icon: '📱',
          subSubCategories: [
            { id: 'apple', name: 'Apple' },
            { id: 'samsung', name: 'Samsung' },
            { id: 'xiaomi', name: 'Xiaomi' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          icon: '🔌',
          subSubCategories: [
            { id: 'cases', name: 'Cases' },
            { id: 'chargers', name: 'Chargers' },
            { id: 'headphones', name: 'Headphones' },
          ],
        },
      ],
    },
    {
      id: 'laptops',
      name: 'Laptops',
      icon: '💻',
      subCategories: [
        {
          id: 'gaming',
          name: 'Gaming',
          icon: '🎮',
          subSubCategories: [
            { id: 'asus', name: 'Asus' },
            { id: 'msi', name: 'MSI' },
            { id: 'razer', name: 'Razer' },
          ],
        },
        {
          id: 'business',
          name: 'Business',
          icon: '💼',
          subSubCategories: [
            { id: 'dell', name: 'Dell' },
            { id: 'hp', name: 'HP' },
            { id: 'lenovo', name: 'Lenovo' },
          ],
        },
      ],
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

      {/* Subcategory Filter */}
      {selectedCategory && categories.find(cat => cat.id === selectedCategory)?.subCategories && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSubCategory === null ? 'default' : 'outline'}
            onClick={() => window.history.pushState({}, '', `/shops?category=${selectedCategory}`)}
          >
            All {categories.find(cat => cat.id === selectedCategory)?.name}
          </Button>
          {categories.find(cat => cat.id === selectedCategory)?.subCategories.map((subCat) => (
            <Button
              key={subCat.id}
              variant={selectedSubCategory === subCat.id ? 'default' : 'outline'}
              onClick={() => window.history.pushState({}, '', `/shops?category=${selectedCategory}&subcategory=${subCat.id}`)}
              className="gap-2"
            >
              {subCat.icon && <span>{subCat.icon}</span>}
              {subCat.name}
            </Button>
          ))}
        </div>
      )}

      {/* Sub-subcategory Filter */}
      {selectedSubCategory && categories
        .find(cat => cat.id === selectedCategory)
        ?.subCategories.find(sub => sub.id === selectedSubCategory)
        ?.subSubCategories && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSubSubCategory === null ? 'default' : 'outline'}
            onClick={() => window.history.pushState({}, '', `/shops?category=${selectedCategory}&subcategory=${selectedSubCategory}`)}
          >
            All {categories.find(cat => cat.id === selectedCategory)?.subCategories.find(sub => sub.id === selectedSubCategory)?.name}
          </Button>
          {categories
            .find(cat => cat.id === selectedCategory)
            ?.subCategories.find(sub => sub.id === selectedSubCategory)
            ?.subSubCategories?.map((subSubCat) => (
            <Button
              key={subSubCat.id}
              variant={selectedSubSubCategory === subSubCat.id ? 'default' : 'outline'}
              onClick={() => window.history.pushState({}, '', `/shops?category=${selectedCategory}&subcategory=${selectedSubCategory}&subsubcategory=${subSubCat.id}`)}
            >
              {subSubCat.name}
            </Button>
          ))}
        </div>
      )}

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
