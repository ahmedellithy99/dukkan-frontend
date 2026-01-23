'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/store/marketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Store, Package, Search, X, Clock, TrendingUp } from 'lucide-react';
import { mockData } from '@/lib/api';
import Link from 'next/link';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useMarketplaceStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home, href: '/' },
    { id: 'shops' as const, label: 'Shops', icon: Store, href: '/shops' },
    { id: 'products' as const, label: 'Products', icon: Package, href: '/products' },
  ];

  // Popular searches and recent searches (you can store these in localStorage)
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

  // Generate search suggestions based on input
  const generateSuggestions = (query: string) => {
    if (!query.trim()) {
      return [
        ...recentSearches.map(search => ({ 
          type: 'recent', 
          text: search, 
          icon: Clock 
        })),
        ...popularSearches.slice(0, 5).map(search => ({ 
          type: 'popular', 
          text: search, 
          icon: TrendingUp 
        }))
      ];
    }

    const suggestions = [];
    
    // Search in products
    const matchingProducts = mockData.products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
    
    // Search in shops
    const matchingShops = mockData.shops.filter(shop =>
      shop.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 2);

    // Add product suggestions
    matchingProducts.forEach(product => {
      suggestions.push({
        type: 'product',
        text: product.name,
        subtitle: `Product • ${mockData.shops.find(s => s.id === product.shopId)?.name}`,
        icon: Package,
        action: () => router.push(`/products?search=${encodeURIComponent(product.name)}`)
      });
    });

    // Add shop suggestions
    matchingShops.forEach(shop => {
      suggestions.push({
        type: 'shop',
        text: shop.name,
        subtitle: `Shop • ${shop.address}`,
        icon: Store,
        action: () => router.push(`/shops/${shop.id}`)
      });
    });

    // Add direct search suggestions
    if (query.length > 1) {
      suggestions.unshift({
        type: 'search',
        text: `Search for "${query}"`,
        subtitle: 'Search all products',
        icon: Search,
        action: () => handleDirectSearch(query)
      });
    }

    return suggestions.slice(0, 8);
  };

  const handleDirectSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.action) {
      suggestion.action();
    } else {
      handleDirectSearch(suggestion.text);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    const suggestions = generateSuggestions(value);
    setSearchSuggestions(suggestions);
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
    const suggestions = generateSuggestions(searchQuery);
    setSearchSuggestions(suggestions);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleDirectSearch(searchQuery);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsSearchFocused(false);
      inputRef.current?.blur();
    }
  };

  // Close suggestions when clicking outside
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
    // Clear search from URL if on shops or products page
    if (pathname === '/shops') {
      router.push('/shops');
    } else if (pathname === '/products') {
      router.push('/products');
    }
  };

  return (
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

          {/* Search Bar with Dropdown */}
          <div className="flex-1 max-w-md mx-1 sm:mx-4 min-w-0 relative" ref={searchRef}>
            <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search products, shops..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="pl-11 pr-11 h-10 sm:h-11 text-base sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg border z-50 max-h-96 overflow-y-auto">
                <CardContent className="p-0">
                  {searchSuggestions.length > 0 ? (
                    <div className="py-2">
                      {!searchQuery && recentSearches.length > 0 && (
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                          Recent Searches
                        </div>
                      )}
                      {!searchQuery && recentSearches.map((search, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleDirectSearch(search)}
                          className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </button>
                      ))}
                      
                      {!searchQuery && popularSearches.length > 0 && (
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-t">
                          Popular Searches
                        </div>
                      )}
                      
                      {searchSuggestions.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{suggestion.text}</div>
                              {suggestion.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">{suggestion.subtitle}</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No suggestions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="flex items-center gap-2 px-2 h-9 sm:h-auto"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

