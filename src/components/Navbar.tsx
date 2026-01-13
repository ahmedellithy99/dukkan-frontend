'use client';

import { useMarketplaceStore } from '@/store/marketplace';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Home, Store } from 'lucide-react';

export function Navbar() {
  const { currentView, setCurrentView } = useMarketplaceStore();

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'shops' as const, label: 'Shops', icon: Store },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              onClick={() => setCurrentView('home')}
            >
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xl font-bold">Abu Hommos Market</span>
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="flex items-center gap-2"
                  onClick={() => setCurrentView(item.id)}
                >
                  <Icon className="h-4 w-4 sm:hidden" />
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
