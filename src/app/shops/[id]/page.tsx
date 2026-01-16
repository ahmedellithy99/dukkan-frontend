'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/store/marketplace';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, MapPin, Star, Package } from 'lucide-react';
import { mockData, generateWhatsAppLink } from '@/lib/api';
import { notFound } from 'next/navigation';

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const {
    shops,
    products,
    setProducts,
    setIsLoading,
    setError,
  } = useMarketplaceStore();

  const [selectedShop, setSelectedShop] = useState<typeof shops[0] | null>(null);
  const [isLoading, setIsLoadingState] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);

  // Load shop data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Find shop
        const shop = mockData.shops.find(s => String(s.id) === shopId);
        
        if (!shop) {
          setErrorState('Shop not found');
          return;
        }

        setSelectedShop(shop);

        // Load products for this shop
        const shopProducts = mockData.products.filter(
          product => String(product.shopId) === shopId
        );
        setProducts(shopProducts);
      } catch (err) {
        setErrorState('Failed to load shop data. Please try again.');
        console.error('Error loading shop data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [shopId, setProducts, setIsLoading, setError]);

  // If shop not found, show 404
  if (!isLoading && !selectedShop && !error) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="space-y-8">
      {/* Shop Banner */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5">
        {selectedShop?.bannerImage ? (
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
          {isLoading ? (
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : error ? (
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
          ) : selectedShop ? (
            <>
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
            </>
          ) : null}
        </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
