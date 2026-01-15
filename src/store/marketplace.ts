import { create } from 'zustand';
import type { Shop, Product, ViewType, Category } from '@/types/marketplace';

interface MarketplaceState {
  // Current view
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected category filter
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;

  // Selected subcategory
  selectedSubCategory: string | null;
  setSelectedSubCategory: (subCategory: string | null) => void;

  // Selected sub-subcategory
  selectedSubSubCategory: string | null;
  setSelectedSubSubCategory: (subSubCategory: string | null) => void;

  // Selected shop for profile view
  selectedShop: Shop | null;
  setSelectedShop: (shop: Shop | null) => void;

  // Shops data
  shops: Shop[];
  featuredShops: Shop[];
  setShops: (shops: Shop[]) => void;
  setFeaturedShops: (shops: Shop[]) => void;

  // Products data
  products: Product[];
  setProducts: (products: Product[]) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  currentView: 'home' as ViewType,
  searchQuery: '',
  selectedCategory: null,
  selectedSubCategory: null,
  selectedSubSubCategory: null,
  selectedShop: null,
  shops: [],
  featuredShops: [],
  products: [],
  isLoading: false,
  error: null,
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  ...initialState,

  setCurrentView: (view) => set({ currentView: view }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (category) => set({ selectedCategory: category, selectedSubCategory: null, selectedSubSubCategory: null }),

  setSelectedSubCategory: (subCategory) => set({ selectedSubCategory: subCategory, selectedSubSubCategory: null }),

  setSelectedSubSubCategory: (subSubCategory) => set({ selectedSubSubCategory: subSubCategory }),

  setSelectedShop: (shop) => set({ selectedShop: shop }),

  setShops: (shops) => set({ shops }),

  setFeaturedShops: (shops) => set({ featuredShops: shops }),

  setProducts: (products) => set({ products }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
