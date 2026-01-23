'use client';

import { useEffect, useRef } from 'react';
import { useMarketplaceStore } from '@/store/marketplace';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdsCarousel } from '@/components/AdsCarousel';
import { OffersSection } from '@/components/OffersSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockData } from '@/lib/api';
import type { CategoryWithSubCategories } from '@/types/marketplace';
import Link from 'next/link';

export default function MarketplacePage() {
  const {
    featuredOffers,
    setShops,
    setFeaturedShops,
    setProducts,
    setOffers,
    setFeaturedOffers,
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
        setOffers(mockData.offers);
        setFeaturedOffers(mockData.offers.filter(offer => offer.featured));
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setShops, setFeaturedShops, setProducts, setOffers, setFeaturedOffers, setIsLoading, setError]);

  const categories: CategoryWithSubCategories[] = [
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AdsCarousel />
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
          <section className="container mx-auto px-4">
            <h2 className="mb-6 text-2xl font-bold">Shop by Category</h2>
            
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
                  <Link key={category.id} href={`/shops?category=${category.id}`}>
                    <Card className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md flex-shrink-0 w-40">
                      <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                        <span className="text-4xl">{category.icon}</span>
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
                  <Link key={category.id} href={`/shops?category=${category.id}`}>
                    <Card className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md">
                      <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                        <span className="text-4xl">{category.icon}</span>
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
                    <Link key={category.id} href={`/shops?category=${category.id}`}>
                      <Card className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md flex-shrink-0 w-40">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                          <span className="text-4xl">{category.icon}</span>
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

          {/* Offers Section */}
          <OffersSection offers={featuredOffers} />

          {/* CTA Section */}
          <section className="bg-primary px-4 py-16 text-center text-primary-foreground">
            <div className="container mx-auto">
              <h2 className="mb-4 text-3xl font-bold">Ready to Shop Local?</h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Browse all shops and find your perfect style today
              </p>
              <Link href="/shops">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                >
                  Browse All Shops
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
