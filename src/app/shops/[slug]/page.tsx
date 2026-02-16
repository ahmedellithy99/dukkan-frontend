'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, MapPin, Package, Phone } from 'lucide-react';
import { shopsApi, productsApi, generateWhatsAppLink } from '@/lib/api';
import type { Shop, Product } from '@/types/marketplace';
import { notFound } from 'next/navigation';

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const shopSlug = params.slug as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load shop data
  useEffect(() => {
    const loadShop = async () => {
      setIsLoadingShop(true);
      setError(null);

      try {
        console.log('Loading shop with slug:', shopSlug);
        const response = await shopsApi.getBySlug(shopSlug);
        console.log('Shop loaded:', response.data);
        setShop(response.data);
      } catch (err) {
        setError('Shop not found');
        console.error('Error loading shop:', err);
      } finally {
        setIsLoadingShop(false);
      }
    };

    if (shopSlug) {
      loadShop();
    }
  }, [shopSlug]);

  // Load shop products
  useEffect(() => {
    if (!shop) return;

    const loadProducts = async () => {
      setIsLoadingProducts(true);

      try {
        const response = await productsApi.getAll({ shop_id: shop.id });
        setProducts(response.data);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [shop]);

  // Get logo URL from MediaResource
  const getLogoUrl = () => {
    if (!shop?.logo) return null;
    return shop.logo.large_url || shop.logo.url;
  };

  const logoUrl = getLogoUrl();

  // If shop not found, show 404
  if (!isLoadingShop && !shop && error) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Loading State */}
          {isLoadingShop ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-40 w-40 rounded-full" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-20 w-full max-w-2xl" />
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <Card className="border-destructive">
              <CardContent className="p-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/shops')}
                >
                  Browse Shops
                </Button>
              </CardContent>
            </Card>
          ) : shop ? (
            <div className="space-y-8">
              {/* Shop Header */}
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Rounded Logo */}
                <div className="h-40 w-40 overflow-hidden rounded-full bg-gradient-to-br from-muted to-muted-50 shadow-lg">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      🏪
                    </div>
                  )}
                </div>

                {/* Shop Name */}
                <h1 className="text-3xl font-bold">{shop.name}</h1>

                {/* Description */}
                {shop.description && (
                  <p className="text-muted-foreground max-w-2xl">
                    {shop.description}
                  </p>
                )}

                {/* Shop Details */}
                <div className="flex flex-col gap-3 text-sm">
                  {/* Location - Clickable with coordinates */}
                  {shop.location && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-blue-600"
                      onClick={() => {
                        const { latitude, longitude } = shop.location!;
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{shop.location.full_address || shop.location.area}</span>
                    </Button>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* WhatsApp - Clickable */}
                    {shop.whatsapp_number && (
                      <Button
                        size="sm"
                        className="gap-2 bg-green-600 text-white hover:bg-green-700"
                        onClick={() => {
                          const message = `Hi, I'm interested in your shop ${shop.name}`;
                          window.open(generateWhatsAppLink(shop.whatsapp_number!, message), '_blank');
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {shop.whatsapp_number}
                      </Button>
                    )}

                    {/* Phone - Not Clickable */}
                    {shop.phone_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{shop.phone_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Products Count */}
                  {shop.products_count !== undefined && (
                    <p className="text-muted-foreground">
                      {shop.products_count} Product{shop.products_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Products Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Products</h2>
                </div>

                {isLoadingProducts ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-[4/5] w-full" />
                        <CardContent className="p-3 space-y-2">
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
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
