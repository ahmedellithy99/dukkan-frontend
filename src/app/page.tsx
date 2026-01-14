'use client';

import { useEffect, useState, useRef } from 'react';
import { useMarketplaceStore } from '@/store/marketplace';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdsCarousel } from '@/components/AdsCarousel';
import { ShopCard } from '@/components/ShopCard';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Store, MessageCircle, MapPin, Star, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockData, generateWhatsAppLink, formatPrice } from '@/lib/api';
import type { Category } from '@/types/marketplace';

export default function MarketplacePage() {
  const {
    currentView,
    searchQuery,
    selectedCategory,
    selectedShop,
    shops,
    featuredShops,
    products,
    isLoading,
    error,
    setCurrentView,
    setSearchQuery,
    setSelectedCategory,
    setSelectedShop,
    setShops,
    setFeaturedShops,
    setProducts,
    setIsLoading,
    setError,
  } = useMarketplaceStore();

  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call with mock data
        // In production, replace with: await shopsApi.getAll()
        await new Promise(resolve => setTimeout(resolve, 500));

        setShops(mockData.shops);
        setFeaturedShops(mockData.shops.filter(shop => shop.featured));
        setProducts(mockData.products);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setShops, setFeaturedShops, setProducts, setIsLoading, setError]);

  // Filter shops by category and search query
  const filteredShops = shops.filter(shop => {
    const matchesCategory = !selectedCategory || shop.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Load products for selected shop
  useEffect(() => {
    if (selectedShop) {
      const shopProducts = mockData.products.filter(
        product => product.shopId === selectedShop.id
      );
      setProducts(shopProducts);
    }
  }, [selectedShop, setProducts]);

  const categories: { id: Category; name: string; icon: string }[] = [
    { id: 'clothes', name: 'Clothes', icon: '👕' },
    { id: 'shoes', name: 'Shoes', icon: '👟' },
    { id: 'accessories', name: 'Accessories', icon: '⌚' },
    { id: 'cosmetics', name: 'Cosmetics', icon: '💄' },
    { id: 'toys', name: 'Toys', icon: '🧸' },
    { id: 'phones', name: 'Phones', icon: '📱' },
    { id: 'laptops', name: 'Laptops', icon: '💻' },
  ];

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

  // Home View
  const renderHome = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-muted to-muted/50 py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            Discover Local Clothing Shops in Abu Hommos
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Support local brands and find the best fashion near you
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setCurrentView('shops')}
          >
            Browse Shops
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg"
            onClick={() => {
              if (categoriesScrollRef.current) {
                categoriesScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div
            ref={categoriesScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-12 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md flex-shrink-0 w-40"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentView('shops');
                }}
              >
                <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                  <span className="text-4xl">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg"
            onClick={() => {
              if (categoriesScrollRef.current) {
                categoriesScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Shops</h2>
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setCurrentView('shops')}
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ShopSkeleton />
            <ShopSkeleton />
            <ShopSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16 text-center text-primary-foreground">
        <div className="container mx-auto">
          <h2 className="mb-4 text-3xl font-bold">Ready to Shop Local?</h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Browse all shops and find your perfect style today
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="gap-2"
            onClick={() => setCurrentView('shops')}
          >
            <Store className="h-4 w-4" />
            Browse All Shops
          </Button>
        </div>
      </section>
    </div>
  );

  // Shops Listing View
  const renderShops = () => (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Shops'}
        </h1>
        <p className="text-muted-foreground">
          {searchQuery
            ? `Found ${filteredShops.length} shop${filteredShops.length !== 1 ? 's' : ''} matching your search`
            : 'Discover amazing clothing stores in Abu Hommos'
          }
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            className="mt-2 gap-2"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
            Clear search
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            className="gap-2"
          >
            <span>{category.icon}</span>
            {category.name}
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
                onClick={() => setSelectedCategory(null)}
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
  );

  // Shop Profile View
  const renderShopProfile = () => {
    if (!selectedShop) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">No shop selected.</p>
          <Button
            className="mt-4"
            onClick={() => setCurrentView('shops')}
          >
            Browse Shops
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Shop Banner */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5">
          {selectedShop.bannerImage ? (
            <img
              src={selectedShop.bannerImage}
              alt={selectedShop.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              🏪
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Shop Info */}
        <div className="container mx-auto px-4">
          <div className="-mt-32 space-y-6">
            {/* Shop Header Card */}
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <h1 className="text-3xl font-bold">{selectedShop.name}</h1>
                  {selectedShop.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{selectedShop.rating}</span>
                      <span className="text-muted-foreground">Rating</span>
                    </div>
                  )}
                  <p className="text-muted-foreground">{selectedShop.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedShop.address}
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="gap-2 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    const message = `Hi, I'm interested in your shop ${selectedShop.name}`;
                    window.open(generateWhatsAppLink(selectedShop.whatsappNumber, message), '_blank');
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Contact Shop
                </Button>
              </div>
            </Card>

            {/* Products Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Products</h2>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-square w-full" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No Products Yet</h3>
                    <p className="text-muted-foreground">
                      This shop hasn't added any products yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      shopName={selectedShop.name}
                      shopWhatsApp={selectedShop.whatsappNumber}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <AdsCarousel />
            {renderHome()}
          </>
        )}
        {currentView === 'shops' && renderShops()}
        {currentView === 'shop-profile' && renderShopProfile()}
      </main>
      <Footer />
    </div>
  );
}
