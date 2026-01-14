'use client';

import type { Shop } from '@/types/marketplace';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { useMarketplaceStore } from '@/store/marketplace';

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  const { setSelectedShop, setCurrentView } = useMarketplaceStore();

  const handleViewShop = () => {
    setSelectedShop(shop);
    setCurrentView('shop-profile');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      men: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      women: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
      kids: 'bg-green-100 text-green-800 hover:bg-green-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Shop Logo/Image */}
      <div className="relative h-40 bg-gradient-to-br from-muted to-muted-50">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-4xl">🏪</div>
          </div>
        )}
        {shop.featured && (
          <Badge className="absolute right-2 top-2 bg-yellow-500 text-white hover:bg-yellow-600">
            Featured
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-1">{shop.name}</h3>
          {shop.rating && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{shop.rating}</span>
            </div>
          )}
        </div>
        <Badge
          variant="outline"
          className={getCategoryColor(shop.category)}
        >
          {shop.category.charAt(0).toUpperCase() + shop.category.slice(1)}
        </Badge>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
          {shop.description}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{shop.address}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleViewShop}
        >
          View Shop
        </Button>
      </CardFooter>
    </Card>
  );
}
