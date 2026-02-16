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
import { Package, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { productsApi, categoriesApi, shopsApi, getCategoryIcon } from '@/lib/api';
import type { Product, Category, Shop, ProductFilters } from '@/types/marketplace';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('search');
  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('subcategory');
  const shopSlug = searchParams.get('shop');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopDetails, setShopDetails] = useState<{ id: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onDiscount, setOnDiscount] = useState(false);
  const [sortBy, setSortBy] = useState<string>('');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);

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
        const filters: ProductFilters = {};
        
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
  }, [search, categorySlug, subcategorySlug, shopSlug, shopDetails, categories, minPrice, maxPrice, onDiscount, sortBy]);

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
                        <select
                          className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm sm:text-base bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer max-h-[50vh]"
                          style={{ 
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                          }}
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              selectShop(e.target.value);
                            }
                          }}
                        >
                          <option value="">Select a shop...</option>
                          {shops.map((shop) => (
                            <option key={shop.id} value={shop.slug}>
                              {shop.name}
                            </option>
                          ))}
                        </select>
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.isArray(products) && products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
