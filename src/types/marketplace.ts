// Category types
export type Category = 'clothes' | 'shoes' | 'accessories' | 'cosmetics' | 'toys' | 'phones' | 'laptops';

export interface CategoryOption {
  id: Category;
  name: string;
  icon: string;
}

export interface SubSubCategory {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  icon?: string;
  subSubCategories?: SubSubCategory[];
}

export interface CategoryWithSubCategories {
  id: Category;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface SubCategoryOption {
  id: string;
  name: string;
  categoryId: Category;
  subSubCategories?: SubSubCategory[];
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

// Offer types
export interface Offer {
  id: string | number;
  title: string;
  description: string;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  imageUrl?: string;
  shopId: string | number;
  shopName: string;
  shopWhatsApp: string;
  category: Category;
  validUntil: string; // ISO date string
  featured?: boolean;
}
