// Category types
export type Category = 'clothes' | 'shoes' | 'accessories' | 'cosmetics' | 'toys' | 'phones' | 'laptops';

export interface CategoryOption {
  id: Category;
  name: string;
  icon: string;
}

// Shop types
export interface Shop {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  address: string;
  category: Category;
  logo?: string;
  bannerImage?: string;
  whatsappNumber: string;
  rating?: number;
  featured?: boolean;
}

// Product types
export interface Product {
  id: string | number;
  shopId: string | number;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// View types for navigation
export type ViewType = 'home' | 'shops' | 'shop-profile';

// Product detail for modal
export interface ProductDetail extends Product {
  shop: {
    name: string;
    whatsappNumber: string;
  };
}
