'use client';

import type { Shop } from '@/types/marketplace';
import Link from 'next/link';

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  // Get logo URL from MediaResource (prioritize large_url, fallback to thumb_url or url)
  const getLogoUrl = () => {
    if (!shop.logo) return null;
    return shop.logo.large_url || shop.logo.thumb_url || shop.logo.url;
  };

  const logoUrl = getLogoUrl();

  return (
    <Link href={`/shops/${shop.slug}`}>
      <div className="flex flex-col items-center gap-3 transition-transform hover:scale-105">
        {/* Rounded Logo */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-muted to-muted-50 shadow-md">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shop.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-3xl">🏪</div>
            </div>
          )}
        </div>
        
        {/* Shop Name */}
        <h3 className="text-center text-sm font-medium line-clamp-2">
          {shop.name}
        </h3>
      </div>
    </Link>
  );
}
