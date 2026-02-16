'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShopCard } from '@/components/ShopCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { shopsApi } from '@/lib/api';
import type { Shop, PaginationMeta } from '@/types/marketplace';

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('search');
  const area = searchParams.get('area');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load shops from API
  useEffect(() => {
    const loadShops = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const filters: any = { page: currentPage, per_page: 24 };
        if (search) filters.search = search;
        if (area) filters.area = area;

        const response = await shopsApi.getAll(filters);
        setShops(response.data);
        setPagination(response.meta?.pagination || null);
      } catch (err) {
        setError('Failed to load shops. Please try again.');
        console.error('Error loading shops:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadShops();
  }, [search, area, currentPage]);

  // Loading skeleton component
  const ShopSkeleton = () => (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );

  const clearFilters = () => {
    window.history.pushState({}, '', '/shops');
    window.location.reload();
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (area) params.set('area', area);
    params.set('page', page.toString());
    router.push(`/shops?${params.toString()}`);
  };

  const renderPagination = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    const { current_page, last_page } = pagination;
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Show pages around current page
    if (current_page > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
      pages.push(i);
    }

    // Show last page
    if (current_page < last_page - 2) {
      pages.push('...');
    }
    if (last_page > 1) {
      pages.push(last_page);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(current_page - 1)}
          disabled={current_page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-1">
          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
            ) : (
              <Button
                key={page}
                variant={current_page === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(page as number)}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(current_page + 1)}
          disabled={current_page === last_page}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-4 py-8">
          {/* Header */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              {search ? `Search Results for "${search}"` : area ? `Shops in ${area}` : 'All Shops'}
            </h1>
            <p className="text-muted-foreground">
              {pagination
                ? `Showing ${pagination.from || 0}-${pagination.to || 0} of ${pagination.total} shop${pagination.total !== 1 ? 's' : ''}`
                : search
                ? `Found ${shops.length} shop${shops.length !== 1 ? 's' : ''} matching your search`
                : area
                ? `Discover amazing stores in ${area}`
                : 'Discover amazing local stores in Abu Hommos'
              }
            </p>
            {(search || area) && (
              <Button
                variant="ghost"
                className="mt-2 gap-2"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Shops Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {[...Array(8)].map((_, i) => (
                <ShopSkeleton key={i} />
              ))}
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
          ) : shops.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Shops Found</h3>
                <p className="text-muted-foreground">
                  {search || area
                    ? 'No shops found matching your criteria.'
                    : 'No shops available at the moment.'}
                </p>
                {(search || area) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    View All Shops
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
              
              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
