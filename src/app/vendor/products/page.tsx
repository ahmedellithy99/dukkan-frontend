'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi, categoriesApi } from '@/lib/api';
import type { Product, Category } from '@/types/marketplace';
import { Search, X, Plus, Edit, Trash2, Power } from 'lucide-react';
import { ConfirmDialog } from '@/components/vendor/ConfirmDialog';
import { ProductCardSkeletonGrid } from '@/components/vendor/ProductCardSkeleton';

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'server' | 'validation' | 'unknown' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState<string>(''); // '', 'name', '-name', 'price', '-price', 'created_at', '-created_at'
  
  // Mobile filter modals
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showSubcategorySelector, setShowSubcategorySelector] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showSortSelector, setShowSortSelector] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(24);
  const [paginationFrom, setPaginationFrom] = useState(0);
  const [paginationTo, setPaginationTo] = useState(0);
  
  // Shop slug state
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  
  // Action states
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategorySlug) {
        setSubcategories([]);
        setSelectedSubcategorySlug('');
        return;
      }

      try {
        const response = await categoriesApi.getSubcategories(selectedCategorySlug);
        if (response.data && Array.isArray(response.data)) {
          setSubcategories(response.data);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategorySlug]);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async (search?: string, categorySlug?: string, subcategorySlug?: string, status?: string, sort?: string, page: number = 1) => {
    const token = localStorage.getItem('vendor_token');
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setErrorType('auth');
      setLoading(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/vendor/login');
      }, 2000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      // First, get the shop slug from the vendor's shops
      const shopsResponse = await vendorApi.getMyShops(token);
      
      if (!shopsResponse.data || shopsResponse.data.length === 0) {
        setError('No shop found. Please create a shop first.');
        setErrorType('validation');
        setLoading(false);
        return;
      }

      // Get the first shop (assuming single shop per vendor for now)
      const currentShopSlug = shopsResponse.data[0].slug;
      setShopSlug(currentShopSlug);

      // Build filters object
      const filters: any = {};
      if (search) filters.search = search;
      
      // Convert category slug to ID
      if (categorySlug) {
        const category = categories.find(c => c.slug === categorySlug);
        if (category) filters.category_id = category.id;
      }
      
      // Convert subcategory slug to ID
      if (subcategorySlug) {
        const subcategory = subcategories.find(s => s.slug === subcategorySlug);
        if (subcategory) filters.subcategory_id = subcategory.id;
      }
      
      if (status === 'active') filters.is_active = true;
      if (status === 'inactive') filters.is_active = false;
      if (sort) filters.sort = sort;
      
      // Add pagination parameters
      filters.page = page;
      filters.per_page = perPage;

      // Fetch products for this shop with filters
      const productsResponse = await vendorApi.getShopProducts(token, currentShopSlug, filters);
      
      // Extract data from API response
      if (productsResponse.data && Array.isArray(productsResponse.data)) {
        setProducts(productsResponse.data);
      } else {
        setProducts([]);
      }
      
      // Extract pagination metadata
      if (productsResponse.meta?.pagination) {
        const pagination = productsResponse.meta.pagination;
        setCurrentPage(pagination.current_page);
        setTotalPages(pagination.last_page);
        setTotalItems(pagination.total);
        setPerPage(pagination.per_page);
        setPaginationFrom(pagination.from || 0);
        setPaginationTo(pagination.to || 0);
      } else {
        // Reset pagination if no metadata
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(productsResponse.data?.length || 0);
        setPaginationFrom(1);
        setPaginationTo(productsResponse.data?.length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      
      // Determine error type and set appropriate message
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
        setErrorType('network');
      } else if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          setError('Your session has expired. Please log in again.');
          setErrorType('auth');
          // Clear token and redirect to login after a short delay
          localStorage.removeItem('vendor_token');
          setTimeout(() => {
            router.push('/vendor/login');
          }, 2000);
        } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
          setError('You do not have permission to access this resource.');
          setErrorType('auth');
        } else if (errorMessage.includes('validation') || errorMessage.includes('422')) {
          setError('Invalid request. Please check your filters and try again.');
          setErrorType('validation');
        } else if (errorMessage.includes('500') || errorMessage.includes('server')) {
          setError('Server error. Please try again later or contact support.');
          setErrorType('server');
        } else {
          setError(err.message || 'Failed to load products. Please try again.');
          setErrorType('unknown');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        setErrorType('unknown');
      }
    } finally {
      setLoading(false);
    }
  }, [perPage, router, categories, subcategories]);

  // Handler for editing a product
  const handleEditProduct = (productSlug: string) => {
    router.push(`/vendor/products/${productSlug}/edit`);
  };

  // Handler for toggling product status
  const handleToggleStatus = async (productSlug: string) => {
    const token = localStorage.getItem('vendor_token');
    
    if (!token || !shopSlug) {
      alert('Authentication error. Please refresh the page.');
      return;
    }

    try {
      setTogglingProductId(productSlug);
      
      // Call API to toggle status
      await vendorApi.toggleProductStatus(token, shopSlug, productSlug);
      
      // Update the product in the local state
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.slug === productSlug
            ? { ...product, is_active: !product.is_active }
            : product
        )
      );
      
      // Show success message
      alert('Product status updated successfully');
    } catch (err) {
      console.error('Failed to toggle product status:', err);
      
      // Provide specific error messages
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('vendor_token');
          router.push('/vendor/login');
        } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
          alert('You do not have permission to update this product.');
        } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          alert('Product not found. It may have been deleted.');
          // Refresh the product list
          fetchProducts(debouncedSearch, selectedCategorySlug, selectedSubcategorySlug, selectedStatus, sortBy, currentPage);
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert(`Failed to update product status: ${err.message}`);
        }
      } else {
        alert('Failed to update product status. Please try again.');
      }
    } finally {
      setTogglingProductId(null);
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (productSlug: string, productName: string) => {
    // Open confirmation dialog
    setConfirmDialog({
      isOpen: true,
      productId: productSlug,
      productName,
    });
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async () => {
    const { productId: productSlug, productName } = confirmDialog;
    
    if (!productSlug) return;
    
    const token = localStorage.getItem('vendor_token');
    
    if (!token || !shopSlug) {
      alert('Authentication error. Please refresh the page.');
      setConfirmDialog({ isOpen: false, productId: null, productName: '' });
      return;
    }

    try {
      setDeletingProductId(productSlug);
      
      // Call API to delete product
      await vendorApi.deleteProduct(token, shopSlug, productSlug);
      
      // Remove the product from local state
      setProducts(prevProducts =>
        prevProducts.filter(product => product.slug !== productSlug)
      );
      
      // Update total items count
      setTotalItems(prev => prev - 1);
      
      // Show success message
      alert(`"${productName}" has been deleted successfully`);
      
      // If this was the last product on the page and we're not on page 1, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
      // Close dialog
      setConfirmDialog({ isOpen: false, productId: null, productName: '' });
    } catch (err) {
      console.error('Failed to delete product:', err);
      
      // Provide specific error messages
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('vendor_token');
          setConfirmDialog({ isOpen: false, productId: null, productName: '' });
          router.push('/vendor/login');
        } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
          alert('You do not have permission to delete this product.');
        } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          alert('Product not found. It may have already been deleted.');
          // Refresh the product list
          setConfirmDialog({ isOpen: false, productId: null, productName: '' });
          fetchProducts(debouncedSearch, selectedCategorySlug, selectedSubcategorySlug, selectedStatus, sortBy, currentPage);
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert(`Failed to delete product: ${err.message}`);
        }
      } else {
        alert('Failed to delete product. Please try again.');
      }
    } finally {
      setDeletingProductId(null);
    }
  };

  // Handler for canceling deletion
  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, productId: null, productName: '' });
  };

  // Fetch products when debounced search, category, subcategory, status, sort, or page changes
  useEffect(() => {
    fetchProducts(debouncedSearch, selectedCategorySlug, selectedSubcategorySlug, selectedStatus, sortBy, currentPage);
  }, [debouncedSearch, selectedCategorySlug, selectedSubcategorySlug, selectedStatus, sortBy, currentPage, fetchProducts]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, selectedCategorySlug, selectedSubcategorySlug, selectedStatus, sortBy]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </div>

        {/* Search Input Skeleton */}
        <div className="mb-6">
          <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        
        {/* Product Cards Skeleton */}
        <ProductCardSkeletonGrid count={8} />
      </div>
    );
  }

  if (error) {
    // Determine error styling based on error type
    const errorStyles = {
      network: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700',
      },
      auth: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-600 dark:text-yellow-400',
        button: 'bg-yellow-600 hover:bg-yellow-700',
      },
      server: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 hover:bg-red-700',
      },
      validation: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      unknown: {
        bg: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        button: 'bg-gray-600 hover:bg-gray-700',
      },
    };

    const currentErrorStyle = errorStyles[errorType || 'unknown'];

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        
        <div className={`${currentErrorStyle.bg} border ${currentErrorStyle.border} rounded-lg p-6 text-center`}>
          {/* Error Icon */}
          <div className="mb-4">
            {errorType === 'network' && (
              <svg className={`mx-auto h-12 w-12 ${currentErrorStyle.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            )}
            {errorType === 'auth' && (
              <svg className={`mx-auto h-12 w-12 ${currentErrorStyle.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {errorType === 'server' && (
              <svg className={`mx-auto h-12 w-12 ${currentErrorStyle.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {(errorType === 'validation' || errorType === 'unknown') && (
              <svg className={`mx-auto h-12 w-12 ${currentErrorStyle.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Error Message */}
          <p className={`${currentErrorStyle.text} mb-4 text-lg font-medium`}>{error}</p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {errorType !== 'auth' && (
              <button
                onClick={() => fetchProducts(debouncedSearch, selectedCategorySlug, selectedSubcategorySlug, selectedStatus, sortBy, currentPage)}
                className={`px-6 py-2 ${currentErrorStyle.button} text-white rounded-lg transition-colors`}
              >
                Try Again
              </button>
            )}
            
            {errorType === 'auth' && (
              <button
                onClick={() => router.push('/vendor/login')}
                className={`px-6 py-2 ${currentErrorStyle.button} text-white rounded-lg transition-colors`}
              >
                Go to Login
              </button>
            )}
            
            {errorType === 'network' && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
            )}
            
            {errorType === 'validation' && (
              <button
                onClick={() => {
                  // Reset all filters
                  setSearchQuery('');
                  setSelectedCategorySlug('');
                  setSelectedSubcategorySlug('');
                  setSelectedStatus('all');
                  setSortBy('');
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Additional Help Text */}
          {errorType === 'network' && (
            <p className="mt-4 text-sm text-muted-foreground">
              Check your internet connection and try again. If the problem persists, contact support.
            </p>
          )}
          {errorType === 'server' && (
            <p className="mt-4 text-sm text-muted-foreground">
              Our servers are experiencing issues. Please try again in a few minutes.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {totalItems > 0 ? (
              <>
                Showing {paginationFrom}-{paginationTo} of {totalItems} {totalItems === 1 ? 'product' : 'products'}
              </>
            ) : (
              'No products found'
            )}
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/vendor/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Category Filter */}
        <button
          type="button"
          onClick={() => setShowCategorySelector(true)}
          className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between touch-manipulation"
        >
          <span className="truncate">
            {selectedCategorySlug 
              ? categories.find(c => c.slug === selectedCategorySlug)?.name || 'All Categories'
              : 'All Categories'}
          </span>
          <svg className="h-4 w-4 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Subcategory Filter - Only show when category is selected */}
        {selectedCategorySlug && (
          <button
            type="button"
            onClick={() => setShowSubcategorySelector(true)}
            disabled={subcategories.length === 0}
            className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {selectedSubcategorySlug
                ? subcategories.find(s => s.slug === selectedSubcategorySlug)?.name || 'All Subcategories'
                : 'All Subcategories'}
            </span>
            <svg className="h-4 w-4 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Status Filter */}
        <button
          type="button"
          onClick={() => setShowStatusSelector(true)}
          className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between touch-manipulation"
        >
          <span className="truncate">
            {selectedStatus === 'all' ? 'All Status' : selectedStatus === 'active' ? 'Active' : 'Inactive'}
          </span>
          <svg className="h-4 w-4 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Sort Filter */}
        <button
          type="button"
          onClick={() => setShowSortSelector(true)}
          className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between touch-manipulation"
        >
          <span className="truncate">
            {sortBy === '' ? 'Sort By' :
             sortBy === 'name' ? 'Name (A-Z)' :
             sortBy === '-name' ? 'Name (Z-A)' :
             sortBy === 'price' ? 'Price (Low to High)' :
             sortBy === '-price' ? 'Price (High to Low)' :
             sortBy === 'created_at' ? 'Date (Oldest)' :
             sortBy === '-created_at' ? 'Date (Newest)' : 'Sort By'}
          </span>
          <svg className="h-4 w-4 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">No products found</p>
          <button 
            onClick={() => router.push('/vendor/products/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                  {product.main_image && product.main_image.length > 0 ? (
                    <img
                      src={product.main_image[0].large_url || product.main_image[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {product.is_active !== undefined && (
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary">
                      {product.discounted_price
                        ? `${Number(product.discounted_price).toFixed(2)} EGP`
                        : `${Number(product.price).toFixed(2)} EGP`}
                    </span>
                    {product.has_discount && product.discount_value && (
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                        -{product.discount_type === 'percent' ? `${Number(product.discount_value)}%` : `${Number(product.discount_value)} EGP`}
                      </span>
                    )}
                  </div>

                  {product.stock_quantity !== undefined && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Stock: {product.stock_quantity} {product.is_low_stock && '⚠️'}
                    </p>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditProduct(product.slug)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    
                    {/* Toggle Status Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(product.slug);
                      }}
                      disabled={togglingProductId === product.slug}
                      className={`px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        product.is_active
                          ? 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                      aria-label={product.is_active ? `Deactivate ${product.name}` : `Activate ${product.name}`}
                      title={product.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {togglingProductId === product.slug ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.slug, product.name);
                      }}
                      disabled={deletingProductId === product.slug}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete ${product.name}`}
                      title="Delete"
                    >
                      {deletingProductId === product.slug ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="First page"
                >
                  First
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {(() => {
                    const pages: React.ReactElement[] = [];
                    const maxVisible = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            currentPage === i
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          aria-label={`Page ${i}`}
                          aria-current={currentPage === i ? 'page' : undefined}
                        >
                          {i}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  Next
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Last page"
                >
                  Last
                </button>
              </div>

              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="per-page" className="text-sm text-muted-foreground">
                  Per page:
                </label>
                <select
                  id="per-page"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                  <option value="96">96</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDialog.productName}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingProductId === confirmDialog.productId}
      />

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <div 
          className="fixed inset-0 z-999 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowCategorySelector(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full sm:max-w-lg shadow-xl flex flex-col max-h-[80vh] sm:max-h-[70vh] rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">Select Category</h2>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
                onClick={() => setShowCategorySelector(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <div className="space-y-2">
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 border rounded-lg transition-colors touch-manipulation ${
                    selectedCategorySlug === ''
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedCategorySlug('');
                    setSelectedSubcategorySlug('');
                    setShowCategorySelector(false);
                  }}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors touch-manipulation ${
                      selectedCategorySlug === category.slug
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setSelectedCategorySlug(category.slug);
                      setSelectedSubcategorySlug('');
                      setShowCategorySelector(false);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Selector Modal */}
      {showSubcategorySelector && (
        <div 
          className="fixed inset-0 z-999 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowSubcategorySelector(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full sm:max-w-lg shadow-xl flex flex-col max-h-[80vh] sm:max-h-[70vh] rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">Select Subcategory</h2>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
                onClick={() => setShowSubcategorySelector(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <div className="space-y-2">
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 border rounded-lg transition-colors touch-manipulation ${
                    selectedSubcategorySlug === ''
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedSubcategorySlug('');
                    setShowSubcategorySelector(false);
                  }}
                >
                  All Subcategories
                </button>
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors touch-manipulation ${
                      selectedSubcategorySlug === subcategory.slug
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setSelectedSubcategorySlug(subcategory.slug);
                      setShowSubcategorySelector(false);
                    }}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Selector Modal */}
      {showStatusSelector && (
        <div 
          className="fixed inset-0 z-999 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowStatusSelector(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full sm:max-w-lg shadow-xl flex flex-col max-h-[80vh] sm:max-h-[70vh] rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">Select Status</h2>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
                onClick={() => setShowStatusSelector(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ].map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors touch-manipulation ${
                      selectedStatus === status.value
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setSelectedStatus(status.value);
                      setShowStatusSelector(false);
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Selector Modal */}
      {showSortSelector && (
        <div 
          className="fixed inset-0 z-999 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowSortSelector(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full sm:max-w-lg shadow-xl flex flex-col max-h-[80vh] sm:max-h-[70vh] rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">Sort By</h2>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
                onClick={() => setShowSortSelector(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <div className="space-y-2">
                {[
                  { value: '', label: 'Default' },
                  { value: 'name', label: 'Name (A-Z)' },
                  { value: '-name', label: 'Name (Z-A)' },
                  { value: 'price', label: 'Price (Low to High)' },
                  { value: '-price', label: 'Price (High to Low)' },
                  { value: 'created_at', label: 'Date (Oldest First)' },
                  { value: '-created_at', label: 'Date (Newest First)' }
                ].map((sort) => (
                  <button
                    key={sort.value}
                    type="button"
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors touch-manipulation ${
                      sortBy === sort.value
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setSortBy(sort.value);
                      setShowSortSelector(false);
                    }}
                  >
                    {sort.label}
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
