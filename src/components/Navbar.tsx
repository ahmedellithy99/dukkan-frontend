'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/store/marketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Store, Package, Search, X, Clock, TrendingUp } from 'lucide-react';
import { searchApi } from '@/lib/api';
import type { SearchSuggestion } from '@/types/marketplace';
import Link from 'next/link';
import { ThemeToggleSimple } from '@/components/theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useMarketplaceStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<SearchSuggestion[]>([]);
  const [shopSuggestions, setShopSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure component is mounted before using portals
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home, href: '/' },
    { id: 'shops' as const, label: 'Shops', icon: Store, href: '/shops' },
    { id: 'products' as const, label: 'Products', icon: Package, href: '/products' },
  ];

  // Popular searches and recent searches
  const popularSearches = [
    'Cotton Shirts',
    'Summer Dresses', 
    'Sneakers',
    'Formal Wear',
    'Kids Clothing',
    'Accessories',
    'Winter Jackets',
    'Handbags'
  ];

  const recentSearches = [
    'Casual Shirt',
    'Denim Jeans',
    'Sports Shoes'
  ];

  // Fetch search suggestions from API with debouncing
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setProductSuggestions([]);
      setShopSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      // Fetch both product and shop suggestions in parallel
      const [productsResponse, shopsResponse] = await Promise.all([
        searchApi.getSuggestions(query, 'products', 5),
        searchApi.getSuggestions(query, 'shops', 3)
      ]);

      setProductSuggestions(productsResponse.data.suggestions);
      setShopSuggestions(shopsResponse.data.suggestions);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setProductSuggestions([]);
      setShopSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced search handler
  const handleInputChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    if (value.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300); // 300ms debounce
    } else {
      setProductSuggestions([]);
      setShopSuggestions([]);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleDirectSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    setShowMobileSearch(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
    inputRef.current?.blur();
  };

  const handleProductClick = (product: SearchSuggestion) => {
    setShowSuggestions(false);
    setIsSearchFocused(false);
    setShowMobileSearch(false);
    router.push(`/products/${product.slug}`);
    inputRef.current?.blur();
  };

  const handleShopClick = (shop: SearchSuggestion) => {
    setShowSuggestions(false);
    setIsSearchFocused(false);
    setShowMobileSearch(false);
    router.push(`/shops/${shop.slug}`);
    inputRef.current?.blur();
  };

  const handleDesktopInputFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
    if (searchQuery.trim().length >= 2) {
      fetchSuggestions(searchQuery);
    }
  };

  const handleDesktopInputBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleMobileSearchOpen = () => {
    setShowMobileSearch(true);
    if (searchQuery.trim().length >= 2) {
      fetchSuggestions(searchQuery);
    }
  };

  const handleMobileSearchClose = () => {
    setShowMobileSearch(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleDirectSearch(searchQuery);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsSearchFocused(false);
      setShowMobileSearch(false);
      inputRef.current?.blur();
    }
  };

  // Close suggestions when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setShowMobileSearch(false);
    // Clear search from URL if on shops or products page
    if (pathname === '/shops') {
      router.push('/shops');
    } else if (pathname === '/products') {
      router.push('/products');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-3 py-3 sm:px-4 sm:py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link href="/" className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 h-9 sm:h-auto"
                >
                  <img
                    src="/dukkan-logo.svg"
                    alt="Dukkan"
                    className="h-6 sm:h-8 w-auto"
                  />
                  <span className="text-lg sm:text-2xl font-bold font-arabic">دكان</span>
                </Button>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden sm:flex flex-1 max-w-md mx-4 min-w-0 relative" ref={searchRef}>
              <div className={`relative w-full transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, shops..."
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={handleDesktopInputFocus}
                  onBlur={handleDesktopInputBlur}
                  onKeyDown={handleKeyDown}
                  className="pl-11 pr-11 h-11 text-sm rounded-md"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Desktop Search Suggestions Dropdown */}
              {showSuggestions && (
                <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg border z-50 max-h-96 overflow-y-auto rounded-md">
                  <CardContent className="p-0">
                    {!searchQuery || searchQuery.length < 2 ? (
                      <div className="py-2">
                        {recentSearches.length > 0 && (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                              Recent Searches
                            </div>
                            {recentSearches.map((search, index) => (
                              <button
                                key={`recent-${index}`}
                                onClick={() => handleDirectSearch(search)}
                                className="w-full px-3 py-3 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-3 border-b border-muted/30 last:border-b-0"
                              >
                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium">{search}</span>
                              </button>
                            ))}
                          </>
                        )}
                        
                        {popularSearches.length > 0 && (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                              Popular Searches
                            </div>
                            {popularSearches.slice(0, 5).map((search, index) => (
                              <button
                                key={`popular-${index}`}
                                onClick={() => handleDirectSearch(search)}
                                className="w-full px-3 py-3 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-3 border-b border-muted/30 last:border-b-0"
                              >
                                <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium">{search}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    ) : isLoadingSuggestions ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm">Searching...</p>
                      </div>
                    ) : productSuggestions.length === 0 && shopSuggestions.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No suggestions found</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {/* Direct search option */}
                        <button
                          onClick={() => handleDirectSearch(searchQuery)}
                          className="w-full px-3 py-3 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-3 border-b border-muted/30"
                        >
                          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate leading-tight">
                              Search for "{searchQuery}"
                            </div>
                            <div className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
                              Search all products
                            </div>
                          </div>
                        </button>

                        {/* Product suggestions */}
                        {productSuggestions.length > 0 && (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                              Products
                            </div>
                            {productSuggestions.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="w-full px-3 py-3 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-3 border-b border-muted/30 last:border-b-0"
                              >
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded flex-shrink-0"
                                  />
                                ) : (
                                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate leading-tight">
                                    {product.name}
                                  </div>
                                  {product.price != null && typeof product.price === 'number' && (
                                    <div className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
                                      EGP {product.price.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Shop suggestions */}
                        {shopSuggestions.length > 0 && (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                              Shops
                            </div>
                            {shopSuggestions.map((shop) => (
                              <button
                                key={shop.id}
                                onClick={() => handleShopClick(shop)}
                                className="w-full px-3 py-3 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-3 border-b border-muted/30 last:border-b-0"
                              >
                                {shop.image ? (
                                  <img 
                                    src={shop.image} 
                                    alt={shop.name}
                                    className="h-10 w-10 object-cover rounded-full flex-shrink-0"
                                  />
                                ) : (
                                  <Store className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate leading-tight">
                                    {shop.name}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Desktop: Show all nav items with text */}
              <div className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.id} href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="flex items-center gap-2 px-2 sm:px-3 h-9 sm:h-auto min-w-0"
                        title={item.label}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden md:inline text-sm">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Theme Toggle - Desktop */}
                <ThemeToggleSimple />
              </div>

              {/* Mobile: Show nav items + search icon at the end */}
              <div className="sm:hidden flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.id} href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-9 w-9"
                        title={item.label}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Search Icon at the far right */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMobileSearchOpen}
                  className="h-9 w-9"
                  title="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Theme Toggle - Mobile */}
                <ThemeToggleSimple />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Full-Screen Search Overlay - Rendered as Portal */}
      {isMounted && showMobileSearch && createPortal(
        <div className="fixed inset-0 bg-background z-[999999] flex flex-col">
          {/* Mobile Search Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <button
              onClick={handleMobileSearchClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products, shops..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-11 pr-11 h-12 text-base rounded-lg"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-1">
              {!searchQuery || searchQuery.length < 2 ? (
                <>
                  {recentSearches.length > 0 && (
                    <>
                      <div className="px-2 py-3 text-sm font-semibold text-muted-foreground">
                        Recent Searches
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleDirectSearch(search)}
                          className="w-full px-4 py-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-4 rounded-lg"
                        >
                          <Clock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          <span className="text-lg font-medium">{search}</span>
                        </button>
                      ))}
                    </>
                  )}
                  
                  {popularSearches.length > 0 && (
                    <>
                      <div className="px-2 py-3 text-sm font-semibold text-muted-foreground mt-6">
                        Popular Searches
                      </div>
                      {popularSearches.slice(0, 6).map((search, index) => (
                        <button
                          key={`popular-${index}`}
                          onClick={() => handleDirectSearch(search)}
                          className="w-full px-4 py-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-4 rounded-lg"
                        >
                          <TrendingUp className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          <span className="text-lg font-medium">{search}</span>
                        </button>
                      ))}
                    </>
                  )}

                  <div className="flex items-center justify-center p-8 mt-8">
                    <div className="text-center text-muted-foreground">
                      <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">Start searching</h3>
                      <p className="text-base">Find products and shops</p>
                    </div>
                  </div>
                </>
              ) : isLoadingSuggestions ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center text-muted-foreground">
                    <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-base">Searching...</p>
                  </div>
                </div>
              ) : productSuggestions.length === 0 && shopSuggestions.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center text-muted-foreground">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No results found</h3>
                    <p className="text-base">Try searching for something else</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Direct search option */}
                  <button
                    onClick={() => handleDirectSearch(searchQuery)}
                    className="w-full px-4 py-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-4 rounded-lg mb-4 bg-primary/10"
                  >
                    <Search className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-medium truncate leading-tight">
                        Search for "{searchQuery}"
                      </div>
                      <div className="text-base text-muted-foreground truncate mt-1 leading-tight">
                        Search all products
                      </div>
                    </div>
                  </button>

                  {/* Product suggestions */}
                  {productSuggestions.length > 0 && (
                    <>
                      <div className="px-2 py-3 text-sm font-semibold text-muted-foreground">
                        Products
                      </div>
                      {productSuggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full px-4 py-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-4 rounded-lg"
                        >
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="h-14 w-14 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-medium truncate leading-tight">
                              {product.name}
                            </div>
                            {product.price != null && typeof product.price === 'number' && (
                              <div className="text-base text-muted-foreground truncate mt-1 leading-tight">
                                EGP {product.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Shop suggestions */}
                  {shopSuggestions.length > 0 && (
                    <>
                      <div className="px-2 py-3 text-sm font-semibold text-muted-foreground mt-6">
                        Shops
                      </div>
                      {shopSuggestions.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => handleShopClick(shop)}
                          className="w-full px-4 py-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center gap-4 rounded-lg"
                        >
                          {shop.image ? (
                            <img 
                              src={shop.image} 
                              alt={shop.name}
                              className="h-14 w-14 object-cover rounded-full flex-shrink-0"
                            />
                          ) : (
                            <Store className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-medium truncate leading-tight">
                              {shop.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}