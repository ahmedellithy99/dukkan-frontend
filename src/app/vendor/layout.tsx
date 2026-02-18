'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Store
} from 'lucide-react';
import { vendorApi } from '@/lib/api';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');

  useEffect(() => {
    const verifyAuth = async () => {
      // Skip auth check for login and register pages
      if (pathname === '/vendor/login' || pathname === '/vendor/register') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('vendor_token');

      if (!token) {
        router.push('/vendor/login');
        return;
      }

      try {
        const response = await vendorApi.me(token);
        setVendorName(response.data.name);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.removeItem('vendor_token');
        router.push('/vendor/login');
      }
    };

    verifyAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    const token = localStorage.getItem('vendor_token');
    if (token) {
      vendorApi.logout(token).catch(console.error);
    }
    localStorage.removeItem('vendor_token');
    router.push('/vendor/login');
  };

  // Show loading screen while verifying
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If on login/register page, just render children without layout
  if (pathname === '/vendor/login' || pathname === '/vendor/register') {
    return <>{children}</>;
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/vendor/products', icon: Package },
    { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Vendor Dashboard</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-bold text-xl">Vendor Portal</h1>
                <p className="text-sm text-muted-foreground">{vendorName}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
