'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import type { Product } from '@/types/marketplace';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

interface OffersSectionProps {
  offers: Product[];
}

export function OffersSection({ offers }: OffersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Filter only products with discounts
  const discountedProducts = offers.filter(product => 
    product.has_discount && product.discount_value
  );

  if (!discountedProducts || discountedProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Best Offers
          </h2>
          <p className="text-muted-foreground mt-1">
            Don't miss these amazing deals from local shops
          </p>
        </div>
        <Link href="/products?on_discount=true">
          <Button variant="outline" size="sm">
            View All Offers
          </Button>
        </Link>
      </div>

      {/* Mobile: Horizontal scroll - Show more offers */}
      <div className="md:hidden relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 px-12 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {discountedProducts.slice(0, 20).map((product) => (
            <div key={product.id} className="shrink-0 w-60">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: Grid layout - 5 columns, 2 rows (10 offers max) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {discountedProducts.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
