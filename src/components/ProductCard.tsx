'use client';

import type { Product } from '@/types/marketplace';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink, formatPrice } from '@/lib/api';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ProductCardProps {
  product: Product;
  shopName: string;
  shopWhatsApp: string;
}

export function ProductCard({ product, shopName, shopWhatsApp }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleContactOnWhatsApp = () => {
    const message = `Hi, I'm interested in ${product.name}`;
    const whatsappUrl = generateWhatsAppLink(shopWhatsApp, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              👕
            </div>
          )}
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="flex-1 font-semibold line-clamp-2">{product.name}</h3>
            {product.price && (
              <Badge variant="secondary" className="whitespace-nowrap">
                {formatPrice(product.price)}
              </Badge>
            )}
          </div>
          {product.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
          {product.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {product.category}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={handleContactOnWhatsApp}
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            Contact on WhatsApp
          </Button>
        </CardFooter>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Product details for {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl">
                  👕
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              {product.description && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              )}

              {product.price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-lg font-bold">
                    {formatPrice(product.price)}
                  </span>
                </div>
              )}

              {product.category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shop</span>
                <span className="font-medium">{shopName}</span>
              </div>
            </div>

            {/* WhatsApp Contact Button */}
            <Button
              className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
              onClick={handleContactOnWhatsApp}
            >
              <MessageCircle className="h-4 w-4" />
              Contact {shopName} on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
