import { create } from 'zustand';
import type { Shop, Product, Category, Subcategory, Attribute } from '@/types/marketplace';

interface MarketplaceState {
  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Categories data
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // Subcategories data
  subcategories: Subcategory[];
  setSubcategories: (subcategories: Subcategory[]) => void;

  // Attributes data
  attributes: Attribute[];
  setAttributes: (attributes: Attribute[]) => void;

  // Shops data
  shops: Shop[];
  setShops: (shops: Shop[]) => void;

  // Products data
  products: Product[];
  setProducts: (products: Product[]) => void;

  // Offers data (products with discounts)
  offers: Product[];
  setOffers: (offers: Product[]) => void;

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
  searchQuery: '',
  categories: [],
  subcategories: [],
  attributes: [],
  shops: [],
  products: [],
  offers: [],
  isLoading: false,
  error: null,
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  ...initialState,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCategories: (categories) => set({ categories }),

  setSubcategories: (subcategories) => set({ subcategories }),

  setAttributes: (attributes) => set({ attributes }),

  setShops: (shops) => set({ shops }),

  setProducts: (products) => set({ products }),

  setOffers: (offers) => set({ offers }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
