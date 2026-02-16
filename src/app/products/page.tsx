'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, X, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi, categoriesApi, shopsApi, getCategoryIcon } from '@/lib/api';
import type { Product, Category, Shop, ProductFilters, PaginationMeta } from '@/types/marketplace';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('search');
  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('subcategory');
  const shopSlug = searchParams.get('shop');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopDetails, setShopDetails] = useState<{ id: number; name: string } | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onDiscount, setOnDiscount] = useState(false);
  const [sortBy, setSortBy] = useState<string>('');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showShopSelector, setShowShopSelector] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Load shops on mount
  useEffect(() => {
    const loadShops = async () => {
      try {
        const response = await shopsApi.getAll({ per_page: 100 }); // Load up to 100 shops
        setShops(response.data);
      } catch (err) {
        console.error('Error loading shops:', err);
      }
    };

    loadShops();
  }, []);

  // Load shop details when shop slug changes
  useEffect(() => {
    const loadShopDetails = async () => {
      if (!shopSlug) {
        setShopDetails(null);
        return;
      }

      try {
        const response = await shopsApi.getBySlug(shopSlug);
        setShopDetails({
          id: response.data.id,
          name: response.data.name
        });
      } catch (err) {
        console.error('Error loading shop details:', err);
        setShopDetails(null);
      }
    };

    loadShopDetails();
  }, [shopSlug]);

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build filters object using ProductFilters type
        const filters: ProductFilters = {
          page: currentPage,
          per_page: 24
        };
        
        if (search) {
          filters.search = search;
        }

        // Find category and subcategory IDs from slugs
        if (categorySlug) {
          const category = categories.find(c => c.slug === categorySlug);
          if (category) {
            filters.category_id = category.id;

            if (subcategorySlug && category.subcategories) {
              const subcategory = category.subcategories.find(s => s.slug === subcategorySlug);
              if (subcategory) {
                filters.subcategory_id = subcategory.id;
              }
            }
          }
        }

        // Shop filter - use shop ID from fetched shop details
        if (shopDetails) {
          filters.shop_id = shopDetails.id;
        }

        // Price filters
        if (minPrice && !isNaN(Number(minPrice))) {
          filters.min_price = Number(minPrice);
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
          filters.max_price = Number(maxPrice);
        }

        // Boolean filters
        if (onDiscount) {
          filters.on_discount = true;
        }

        // Sort
        if (sortBy) {
          filters.sort = sortBy;
        }

        const response = await productsApi.getAll(filters);
        setProducts(response.data);
        setPagination(response.meta?.pagination || null);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load products if categories are loaded (needed for ID lookup)
    // Also wait for shop details if shop filter is active
    if ((categories.length > 0 || (!categorySlug && !subcategorySlug)) && 
        (!shopSlug || shopDetails)) {
      loadProducts();
    }
  }, [search, categorySlug, subcategorySlug, shopSlug, shopDetails, categories, minPrice, maxPrice, onDiscount, sortBy, currentPage]);

  // Get selected category and subcategory
  const selectedCategory = Array.isArray(categories) ? categories.find(c => c.slug === categorySlug) : undefined;
  const selectedSubcategory = selectedCategory?.subcategories?.find(s => s.slug === subcategorySlug);

  // Get display name for header
  const getDisplayName = () => {
    if (search) return `Search Results for "${search}"`;
    if (shopDetails) return `Products from ${shopDetails.name}`;
    if (selectedSubcategory) return `${selectedSubcategory.name} Products`;
    if (selectedCategory) return `${selectedCategory.name} Products`;
    return 'All Products';
  };

  // Get description for header
  const getDescription = () => {
    if (pagination) {
      return `Showing ${pagination.from || 0}-${pagination.to || 0} of ${pagination.total} product${pagination.total !== 1 ? 's' : ''}`;
    }
    if (search) {
      return `Found ${products.length} product${products.length !== 1 ? 's' : ''} matching your search`;
    }
    if (shopDetails) {
      return `Browse all products from ${shopDetails.name}`;
    }
    if (selectedSubcategory) {
      return `Browse ${selectedSubcategory.name.toLowerCase()} products`;
    }
    if (selectedCategory) {
      return `Discover amazing ${selectedCategory.name.toLowerCase()} products`;
    }
    return 'Browse all available products';
  };

  // Clear filter handlers
  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/products?${params.toString()}`);
  };

  const clearShop = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('shop');
    router.push(`/products?${params.toString()}`);
  };

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('subcategory');
    router.push(`/products?${params.toString()}`);
  };

  const clearSubcategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcategory');
    router.push(`/products?${params.toString()}`);
  };

  const selectCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', slug);
    params.delete('subcategory');
    router.push(`/products?${params.toString()}`);
  };

  const selectSubcategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('subcategory', slug);
    router.push(`/products?${params.toString()}`);
  };

  const selectShop = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('shop', slug);
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setOnDiscount(false);
    setSortBy('');
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/products?${params.toString()}`);
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
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex gap-1">
          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm">...</span>
            ) : (
              <Button
                key={page}
                variant={current_page === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(page as number)}
                className="min-w-[2.5rem]"
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
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const hasActiveFilters = minPrice || maxPrice || onDiscount || sortBy;

  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-3/4 w-full" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:scrollbar-hide space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  className="w-full lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {showFilters ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </Button>

                {/* Filters Panel */}
                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Shop Filter Indicator */}
                  {shopDetails && (
                    <Card className="border-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">Filtering by Shop</h3>
                            <p className="text-sm text-muted-foreground">{shopDetails.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={clearShop}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Shop Selector */}
                  {!shopDetails && shops.length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <Filter className="h-4 w-4" />
                          Filter by Shop
                        </h3>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-sm"
                          onClick={() => setShowShopSelector(true)}
                        >
                          <span>Select a shop...</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category Filter */}
                  {Array.isArray(categories) && categories.length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-sm">
                          <Filter className="h-4 w-4" />
                          Category
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={!categorySlug ? "default" : "outline"}
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={clearCategory}
                          >
                            All
                          </Button>
                          {categories.map((cat) => (
                            <Button
                              key={cat.id}
                              variant={categorySlug === cat.slug ? "default" : "outline"}
                              size="sm"
                              className="h-8 px-2 text-xs gap-1"
                              onClick={() => selectCategory(cat.slug)}
                            >
                              <span className="text-sm">{getCategoryIcon(cat.name)}</span>
                              <span className="hidden sm:inline">{cat.name}</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Subcategory Filter */}
                  {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-sm">
                          <Filter className="h-4 w-4" />
                          Subcategory
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={!subcategorySlug ? "default" : "outline"}
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={clearSubcategory}
                          >
                            All
                          </Button>
                          {selectedCategory.subcategories.map((subcat) => (
                            <Button
                              key={subcat.id}
                              variant={subcategorySlug === subcat.slug ? "default" : "outline"}
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => selectSubcategory(subcat.slug)}
                            >
                              {subcat.name}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Price Range */}
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Price Range
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="min-price" className="text-xs">Min Price (EGP)</Label>
                          <Input
                            id="min-price"
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-price" className="text-xs">Max Price (EGP)</Label>
                          <Input
                            id="max-price"
                            type="number"
                            placeholder="10000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability & Offers */}
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold">Offers</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="on-discount"
                            checked={onDiscount}
                            onCheckedChange={(checked) => setOnDiscount(checked as boolean)}
                          />
                          <Label htmlFor="on-discount" className="text-sm cursor-pointer">
                            On Discount
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sort By */}
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold">Sort By</h3>
                      <div className="space-y-2">
                        <Button
                          variant={sortBy === 'price' ? 'default' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSortBy(sortBy === 'price' ? '' : 'price')}
                        >
                          Price: Low to High
                        </Button>
                        <Button
                          variant={sortBy === '-price' ? 'default' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSortBy(sortBy === '-price' ? '' : '-price')}
                        >
                          Price: High to Low
                        </Button>
                        <Button
                          variant={sortBy === '-created_at' ? 'default' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSortBy(sortBy === '-created_at' ? '' : '-created_at')}
                        >
                          Newest First
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearAllFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Header */}
              <div>
                <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
                  <Package className="h-8 w-8" />
                  {getDisplayName()}
                </h1>
                <p className="text-muted-foreground">
                  {getDescription()}
                </p>
                
                {/* Active Filters */}
                {(search || shopSlug || categorySlug || subcategorySlug) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {search && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={clearSearch}
                      >
                        <X className="h-4 w-4" />
                        Clear search
                      </Button>
                    )}
                    {shopSlug && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={clearShop}
                      >
                        <X className="h-4 w-4" />
                        Clear shop filter
                      </Button>
                    )}
                    {subcategorySlug && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={clearSubcategory}
                      >
                        <X className="h-4 w-4" />
                        Clear subcategory
                      </Button>
                    )}
                    {categorySlug && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={clearCategory}
                      >
                        <X className="h-4 w-4" />
                        Clear category
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
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
              ) : !Array.isArray(products) || products.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No Products Found</h3>
                    <p className="text-muted-foreground">
                      {search
                        ? 'Try adjusting your search terms or filters.'
                        : categorySlug
                          ? 'No products available in this category.'
                          : 'No products available at the moment.'}
                    </p>
                    {(search || categorySlug || hasActiveFilters) && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          clearAllFilters();
                          router.push('/products');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.isArray(products) && products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Shop Selector Modal */}
      {showShopSelector && (
        <div 
          className="fixed inset-0 z-[999] bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowShopSelector(false)}
        >
          {/* Mobile: Bottom Sheet, Desktop: Centered Modal */}
          <div 
            className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-lg shadow-xl flex flex-col max-h-[80vh] sm:max-h-[70vh] rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">
                Select a Shop
              </h2>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
                onClick={() => setShowShopSelector(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Shop List */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <div className="space-y-2">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    type="button"
                    className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation"
                    onClick={() => {
                      selectShop(shop.slug);
                      setShowShopSelector(false);
                    }}
                  >
                    <span className="text-sm font-medium">{shop.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
