'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi, categoriesApi } from '@/lib/api';
import type { Product, Category } from '@/types/marketplace';
import { Search, X, Plus, Edit, Trash2, Power } from 'lucide-react';

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState<string>(''); // '', 'name', '-name', 'price', '-price', 'created_at', '-created_at'
  
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
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<number | null>(null);

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
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) {
        setSubcategories([]);
        setSelectedSubcategoryId(null);
        return;
      }

      try {
        // Find the selected category to get its slug
        const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
        if (!selectedCategory) return;

        const response = await categoriesApi.getSubcategories(selectedCategory.slug);
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
  }, [selectedCategoryId, categories]);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async (search?: string, categoryId?: number | null, subcategoryId?: number | null, status?: string, sort?: string, page: number = 1) => {
    const token = localStorage.getItem('vendor_token');
    
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, get the shop slug from the vendor's shops
      const shopsResponse = await vendorApi.getMyShops(token);
      
      if (!shopsResponse.data || shopsResponse.data.length === 0) {
        setError('No shop found. Please create a shop first.');
        setLoading(false);
        return;
      }

      // Get the first shop (assuming single shop per vendor for now)
      const currentShopSlug = shopsResponse.data[0].slug;
      setShopSlug(currentShopSlug);

      // Build filters object
      const filters: any = {};
      if (search) filters.search = search;
      if (categoryId) filters.category_id = categoryId;
      if (subcategoryId) filters.subcategory_id = subcategoryId;
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
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  // Handler for editing a product
  const handleEditProduct = (productId: number) => {
    router.push(`/vendor/products/${productId}/edit`);
  };

  // Handler for toggling product status
  const handleToggleStatus = async (productId: number) => {
    const token = localStorage.getItem('vendor_token');
    
    if (!token || !shopSlug) {
      alert('Authentication error. Please refresh the page.');
      return;
    }

    try {
      setTogglingProductId(productId);
      
      // Call API to toggle status
      await vendorApi.toggleProductStatus(token, shopSlug, productId);
      
      // Update the product in the local state
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, is_active: !product.is_active }
            : product
        )
      );
      
      // Show success message
      alert('Product status updated successfully');
    } catch (err) {
      console.error('Failed to toggle product status:', err);
      alert('Failed to update product status. Please try again.');
    } finally {
      setTogglingProductId(null);
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (productId: number, productName: string) => {
    const token = localStorage.getItem('vendor_token');
    
    if (!token || !shopSlug) {
      alert('Authentication error. Please refresh the page.');
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(productId);
      
      // Call API to delete product
      await vendorApi.deleteProduct(token, shopSlug, productId);
      
      // Remove the product from local state
      setProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      );
      
      // Update total items count
      setTotalItems(prev => prev - 1);
      
      // Show success message
      alert('Product deleted successfully');
      
      // If this was the last product on the page and we're not on page 1, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Fetch products when debounced search, category, subcategory, status, sort, or page changes
  useEffect(() => {
    fetchProducts(debouncedSearch, selectedCategoryId, selectedSubcategoryId, selectedStatus, sortBy, currentPage);
  }, [debouncedSearch, selectedCategoryId, selectedSubcategoryId, selectedStatus, sortBy, currentPage, fetchProducts]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, selectedCategoryId, selectedSubcategoryId, selectedStatus, sortBy]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>

        {/* Search Input Skeleton */}
        <div className="mb-6">
          <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
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
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Category Filter */}
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => {
            const newCategoryId = e.target.value ? Number(e.target.value) : null;
            setSelectedCategoryId(newCategoryId);
            // Reset subcategory when category changes
            if (!newCategoryId) {
              setSelectedSubcategoryId(null);
            }
          }}
          className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Subcategory Filter - Only show when category is selected */}
        {selectedCategoryId && (
          <select
            value={selectedSubcategoryId || ''}
            onChange={(e) => setSelectedSubcategoryId(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={subcategories.length === 0}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        )}

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 h-11 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Sort By</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
          <option value="created_at">Date (Oldest First)</option>
          <option value="-created_at">Date (Newest First)</option>
        </select>
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
                      onClick={() => handleEditProduct(product.id)}
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
                        handleToggleStatus(product.id);
                      }}
                      disabled={togglingProductId === product.id}
                      className={`px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        product.is_active
                          ? 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                      aria-label={product.is_active ? `Deactivate ${product.name}` : `Activate ${product.name}`}
                      title={product.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {togglingProductId === product.id ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id, product.name);
                      }}
                      disabled={deletingProductId === product.id}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete ${product.name}`}
                      title="Delete"
                    >
                      {deletingProductId === product.id ? (
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
    </div>
  );
}
