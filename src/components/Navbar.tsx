'use client';

import { useState } from 'react';
import { useMarketplaceStore } from '@/store/marketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Home, Store, Search, X } from 'lucide-react';

export function Navbar() {
  const { currentView, setCurrentView, searchQuery, setSearchQuery } = useMarketplaceStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'shops' as const, label: 'Shops', icon: Store },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Switch to shops view when searching
      setCurrentView('shops');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 h-9 sm:h-auto"
              onClick={() => setCurrentView('home')}
            >
              <img
                src="/dukkan-logo.svg"
                alt="Dukkan"
                className="h-6 sm:h-8 w-auto"
              />
              <span className="text-lg sm:text-2xl font-bold font-arabic">دكان</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-1 sm:mx-4 min-w-0">
            <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-11 pr-11 h-10 sm:h-auto text-base sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="flex items-center gap-2 px-2 h-9 sm:h-auto"
                  onClick={() => setCurrentView(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

