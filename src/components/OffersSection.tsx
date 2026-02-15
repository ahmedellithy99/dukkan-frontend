'use client';

import { useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MessageCircle, Tag } from 'lucide-react';
import type { Product } from '@/types/marketplace';
import { generateWhatsAppLink, getDiscountPercentage } from '@/lib/api';
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

  const handleContactShop = (product: Product) => {
    if (!product.shop?.whatsapp_number) return;
    
    const message = `Hi! I'm interested in your offer: ${product.name}`;
    const whatsappUrl = generateWhatsAppLink(product.shop.whatsapp_number, message);
    window.open(whatsappUrl, '_blank');
  };

  // Filter only products with discounts
  const discountedProducts = offers.filter(product => 
    product.discount_type && product.discount_value && product.discounted_price
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
            <OfferCard 
              key={product.id} 
              product={product} 
              onContact={() => handleContactShop(product)}
              className="shrink-0 w-60"
            />
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
          <OfferCard 
            key={product.id} 
            product={product} 
            onContact={() => handleContactShop(product)}
          />
        ))}
      </div>
    </section>
  );
}

interface OfferCardProps {
  product: Product;
  onContact: () => void;
  className?: string;
}

function OfferCard({ product, onContact, className = '' }: OfferCardProps) {
  const discountPercentage = product.price && product.discounted_price
    ? getDiscountPercentage(product.price, product.discounted_price)
    : product.discount_type === 'percent' && product.discount_value
      ? product.discount_value 
      : 0;

  // Get image URL - prioritize main_image, fallback to secondary_image
  const imageUrl = product.main_image && product.main_image.length > 0
    ? product.main_image[0].large_url || product.main_image[0].url
    : product.secondary_image && product.secondary_image.length > 0
      ? product.secondary_image[0].large_url || product.secondary_image[0].url
      : null;

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${className} flex flex-col h-full`}>
      {/* Product Image - Fixed aspect ratio */}
      <div className="relative aspect-[4/2.5] bg-gradient-to-br from-muted to-muted-50 shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-4xl">🏷️</div>
          </div>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-2 py-0.5">
              -{discountPercentage}%
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Shop Name - Fixed height */}
        {product.shop && (
          <div className="text-xs text-muted-foreground mb-1 h-4 flex items-center">
            <span className="truncate">{product.shop.name}</span>
          </div>
        )}

        {/* Product Name - Fixed height for 2 lines */}
        <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 h-10 flex items-start">
          {product.name}
        </h3>

        {/* Description - Fixed height for 2 lines */}
        {product.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 h-8 flex items-start">
            {product.description}
          </p>
        )}

        {/* Price Section - Fixed height */}
        <div className="flex items-center gap-1.5 mb-2 h-6">
          <span className="text-lg font-bold text-primary">
            {product.discounted_price} EGP
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {product.price} EGP
          </span>
        </div>

        {/* Stock Status */}
        {product.stock_quantity !== undefined && (
          <div className="text-xs text-muted-foreground mb-2 h-4 flex items-center">
            {product.stock_quantity > 0 ? (
              <span className="text-green-600">In Stock ({product.stock_quantity})</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0 shrink-0">
        <Button 
          onClick={onContact}
          className="w-full gap-1.5 text-xs py-1.5 h-8"
          disabled={!product.stock_quantity || product.stock_quantity === 0}
        >
          <MessageCircle className="h-3 w-3" />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Contact Shop'}
        </Button>
      </CardFooter>
    </Card>
  );
}
