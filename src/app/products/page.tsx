'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketplaceStore } from '@/store/marketplace';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, X, Filter } from 'lucide-react';
import { mockData } from '@/lib/api';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const subsubcategory = searchParams.get('subsubcategory');
  const search = searchParams.get('search');
  const shopId = searchParams.get('shop');

  const {
    products,
    shops,
    selectedCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    setProducts,
    setShops,
    setSelectedCategory,
    setSelectedSubCategory,
    setSelectedSubSubCategory,
    setIsLoading,
    setError,
  } = useMarketplaceStore();

  const [isLoading, setIsLoadingState] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingState(true);
      setError(null);

      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(mockData.products);
        setShops(mockData.shops);
      } catch (err) {
        setErrorState('Failed to load data. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoadingState(false);
      }
    };

    loadData();
  }, [setProducts, setShops, setIsLoading, setError]);

  // Sync URL params with store state
  useEffect(() => {
    setSelectedCategory(category as any || null);
    setSelectedSubCategory(subcategory || null);
    setSelectedSubSubCategory(subsubcategory || null);
  }, [category, subcategory, subsubcategory, setSelectedCategory, setSelectedSubCategory, setSelectedSubSubCategory]);

  // Categories data with subcategories
  const categories = [
    {
      id: 'clothes',
      name: 'Clothes',
      icon: '👕',
      subCategories: [
        {
          id: 'men',
          name: 'Men',
          icon: '👨',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'classic', name: 'Classic' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'women',
          name: 'Women',
          icon: '👩',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'classic', name: 'Classic' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'kids',
          name: 'Kids',
          icon: '👶',
          subSubCategories: [
            { id: 'boys', name: 'Boys' },
            { id: 'girls', name: 'Girls' },
          ],
        },
      ],
    },
    {
      id: 'shoes',
      name: 'Shoes',
      icon: '👟',
      subCategories: [
        {
          id: 'men',
          name: 'Men',
          icon: '👨',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'women',
          name: 'Women',
          icon: '👩',
          subSubCategories: [
            { id: 'sport', name: 'Sport' },
            { id: 'casual', name: 'Casual' },
            { id: 'formal', name: 'Formal' },
          ],
        },
        {
          id: 'kids',
          name: 'Kids',
          icon: '👶',
          subSubCategories: [
            { id: 'boys', name: 'Boys' },
            { id: 'girls', name: 'Girls' },
          ],
        },
      ],
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: '⌚',
      subCategories: [
        {
          id: 'men',
          name: 'Men',
          icon: '👨',
          subSubCategories: [
            { id: 'watches', name: 'Watches' },
            { id: 'belts', name: 'Belts' },
            { id: 'glasses', name: 'Glasses' },
          ],
        },
        {
          id: 'women',
          name: 'Women',
          icon: '👩',
          subSubCategories: [
            { id: 'watches', name: 'Watches' },
            { id: 'jewelry', name: 'Jewelry' },
            { id: 'bags', name: 'Bags' },
          ],
        },
      ],
    },
    {
      id: 'cosmetics',
      name: 'Cosmetics',
      icon: '💄',
      subCategories: [
        {
          id: 'makeup',
          name: 'Makeup',
          icon: '💄',
          subSubCategories: [
            { id: 'face', name: 'Face' },
            { id: 'eyes', name: 'Eyes' },
            { id: 'lips', name: 'Lips' },
          ],
        },
        {
          id: 'skincare',
          name: 'Skincare',
          icon: '🧴',
          subSubCategories: [
            { id: 'face', name: 'Face' },
            { id: 'body', name: 'Body' },
          ],
        },
      ],
    },
    {
      id: 'toys',
      name: 'Toys',
      icon: '🧸',
      subCategories: [
        {
          id: 'educational',
          name: 'Educational',
          icon: '📚',
          subSubCategories: [
            { id: 'puzzles', name: 'Puzzles' },
            { id: 'games', name: 'Games' },
          ],
        },
        {
          id: 'action',
          name: 'Action Figures',
          icon: '🦸',
          subSubCategories: [
            { id: 'superheroes', name: 'Superheroes' },
            { id: 'collectibles', name: 'Collectibles' },
          ],
        },
      ],
    },
    {
      id: 'phones',
      name: 'Phones',
      icon: '📱',
      subCategories: [
        {
          id: 'smartphones',
          name: 'Smartphones',
          icon: '📱',
          subSubCategories: [
            { id: 'apple', name: 'Apple' },
            { id: 'samsung', name: 'Samsung' },
            { id: 'xiaomi', name: 'Xiaomi' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          icon: '🔌',
          subSubCategories: [
            { id: 'cases', name: 'Cases' },
            { id: 'chargers', name: 'Chargers' },
            { id: 'headphones', name: 'Headphones' },
          ],
        },
      ],
    },
    {
      id: 'laptops',
      name: 'Laptops',
      icon: '💻',
      subCategories: [
        {
          id: 'gaming',
          name: 'Gaming',
          icon: '🎮',
          subSubCategories: [
            { id: 'asus', name: 'Asus' },
            { id: 'msi', name: 'MSI' },
            { id: 'razer', name: 'Razer' },
          ],
        },
        {
          id: 'business',
          name: 'Business',
          icon: '💼',
          subSubCategories: [
            { id: 'dell', name: 'Dell' },
            { id: 'hp', name: 'HP' },
            { id: 'lenovo', name: 'Lenovo' },
          ],
        },
      ],
    },
  ];

  // Filter products by category, shop, and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesShop = !shopId || String(product.shopId) === shopId;
    const matchesSearch = !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesShop && matchesSearch;
  });

  // Get shop name for product cards
  const getShopInfo = (shopId: string | number) => {
    const shop = shops.find(s => s.id === shopId);
    return {
      name: shop?.name || 'Unknown Shop',
      whatsApp: shop?.whatsappNumber || ''
    };
  };

  const getCategoryDisplayName = () => {
    if (selectedSubSubCategory) {
      return selectedSubSubCategory;
    }
    if (selectedSubCategory) {
      return selectedSubCategory;
    }
    return selectedCategory || '';
  };

  const getSelectedShopName = () => {
    if (shopId) {
      const shop = shops.find(s => String(s.id) === shopId);
      return shop?.name || 'Unknown Shop';
    }
    return null;
  };

  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto space-y-8 px-4 py-8">
          {/* Header */}
          <div>
            <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              {search ? `Search Results for "${search}"` : 
               getSelectedShopName() ? `Products from ${getSelectedShopName()}` :
               getCategoryDisplayName() ? `${getCategoryDisplayName()} Products` : 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {search
                ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} matching your search`
                : getSelectedShopName()
                  ? `Browse all products from ${getSelectedShopName()}`
                  : `Discover amazing ${getCategoryDisplayName().toLowerCase()} products in Abu Hommos`
              }
            </p>
            
            {/* Clear filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.history.pushState({}, '', '/products')}
                >
                  <X className="h-4 w-4" />
                  Clear search
                </Button>
              )}
              {shopId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('shop');
                    window.history.pushState({}, '', url.pathname + url.search);
                  }}
                >
                  <X className="h-4 w-4" />
                  Clear shop filter
                </Button>
              )}
              {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('category');
                    url.searchParams.delete('subcategory');
                    url.searchParams.delete('subsubcategory');
                    window.history.pushState({}, '', url.pathname + url.search);
                  }}
                >
                  <X className="h-4 w-4" />
                  Clear category filters
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">Filter by Category</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('category');
                  url.searchParams.delete('subcategory');
                  url.searchParams.delete('subsubcategory');
                  window.history.pushState({}, '', url.pathname + url.search);
                }}
              >
                All Categories
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('category', cat.id);
                    url.searchParams.delete('subcategory');
                    url.searchParams.delete('subsubcategory');
                    window.history.pushState({}, '', url.pathname + url.search);
                  }}
                  className="gap-2"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Subcategory Filter */}
          {selectedCategory && categories.find(cat => cat.id === selectedCategory)?.subCategories && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubCategory === null ? 'default' : 'outline'}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('subcategory');
                  url.searchParams.delete('subsubcategory');
                  window.history.pushState({}, '', url.pathname + url.search);
                }}
              >
                All {categories.find(cat => cat.id === selectedCategory)?.name}
              </Button>
              {categories.find(cat => cat.id === selectedCategory)?.subCategories.map((subCat) => (
                <Button
                  key={subCat.id}
                  variant={selectedSubCategory === subCat.id ? 'default' : 'outline'}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('subcategory', subCat.id);
                    url.searchParams.delete('subsubcategory');
                    window.history.pushState({}, '', url.pathname + url.search);
                  }}
                  className="gap-2"
                >
                  {subCat.icon && <span>{subCat.icon}</span>}
                  {subCat.name}
                </Button>
              ))}
            </div>
          )}

          {/* Sub-subcategory Filter */}
          {selectedSubCategory && categories
            .find(cat => cat.id === selectedCategory)
            ?.subCategories.find(sub => sub.id === selectedSubCategory)
            ?.subSubCategories && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubSubCategory === null ? 'default' : 'outline'}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('subsubcategory');
                  window.history.pushState({}, '', url.pathname + url.search);
                }}
              >
                All {categories.find(cat => cat.id === selectedCategory)?.subCategories.find(sub => sub.id === selectedSubCategory)?.name}
              </Button>
              {categories
                .find(cat => cat.id === selectedCategory)
                ?.subCategories.find(sub => sub.id === selectedSubCategory)
                ?.subSubCategories?.map((subSubCat) => (
                <Button
                  key={subSubCat.id}
                  variant={selectedSubSubCategory === subSubCat.id ? 'default' : 'outline'}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('subsubcategory', subSubCat.id);
                    window.history.pushState({}, '', url.pathname + url.search);
                  }}
                >
                  {subSubCat.name}
                </Button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
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
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Products Found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory
                    ? `No products found in ${selectedCategory} category.`
                    : shopId
                      ? `No products found for this shop.`
                      : 'No products available at the moment.'}
                </p>
                {(selectedCategory || shopId) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.history.pushState({}, '', '/products')}
                  >
                    View All Products
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const shopInfo = getShopInfo(product.shopId);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    shopName={shopInfo.name}
                    shopWhatsApp={shopInfo.whatsApp}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}