'use client';

import { useEffect, useRef, useState } from 'react';
import { useMarketplaceStore } from '@/store/marketplace';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdsCarousel } from '@/components/AdsCarousel';
import { OffersSection } from '@/components/OffersSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoriesApi, offersApi, adCarouselApi, getCategoryIcon } from '@/lib/api';
import type { AdCarousel } from '@/types/marketplace';
import Link from 'next/link';

export default function MarketplacePage() {
  const {
    categories,
    offers,
    setCategories,
    setOffers,
  } = useMarketplaceStore();

  const [adCarousels, setAdCarousels] = useState<AdCarousel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch data from API in parallel
        const [categoriesResponse, offersResponse, adCarouselsResponse] = await Promise.all([
          categoriesApi.getAll(),
          offersApi.getAll(10), // Get 10 featured offers
          adCarouselApi.getAll(),
        ]);

        // Update store with API data
        setCategories(categoriesResponse.data);
        setOffers(offersResponse.data);
        setAdCarousels(adCarouselsResponse.data || []);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setCategories, setOffers]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AdsCarousel ads={adCarousels} />
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
              <Link href="/shops">
                <Button
                  size="lg"
                  className="gap-2"
                >
                  Browse Shops
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Categories Section */}
          {isLoading ? (
            <section className="container mx-auto px-4">
              <h2 className="mb-6 text-2xl font-bold">Products by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="h-4 w-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : error ? (
            <section className="container mx-auto px-4">
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
            </section>
          ) : categories.length > 0 ? (
            <section className="container mx-auto px-4">
              <h2 className="mb-6 text-2xl font-bold">Products by Category</h2>
              
              {/* Mobile: Slider with navigation buttons */}
              <div className="md:hidden relative">
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
                    <Link key={category.id} href={`/products?category=${category.id}`}>
                      <Card className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md shrink-0 w-40">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                          <span className="text-4xl">{getCategoryIcon(category.name)}</span>
                          <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                        </CardContent>
                      </Card>
                    </Link>
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

              {/* Desktop/Tablet: Grid layout when ≤ 8 elements, otherwise slider */}
              {categories.length <= 8 ? (
                <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7 gap-4">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/products?category=${category.id}`}>
                      <Card className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                          <span className="text-4xl">{getCategoryIcon(category.name)}</span>
                          <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="hidden md:relative">
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
                      <Link key={category.id} href={`/products?category=${category.id}`}>
                        <Card className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md shrink-0 w-40">
                          <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                            <span className="text-4xl">{getCategoryIcon(category.name)}</span>
                            <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                          </CardContent>
                        </Card>
                      </Link>
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
              )}
            </section>
          ) : null}

          {/* Offers Section */}
          <OffersSection offers={offers} />

          {/* CTA Section */}
          <section className="bg-primary px-4 py-16 text-center text-primary-foreground">
            <div className="container mx-auto">
              <h2 className="mb-4 text-3xl font-bold">Ready to Shop Local?</h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Browse all shops and products to find your perfect style today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shops">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2"
                  >
                    Browse All Shops
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

