// API Response Wrapper
export interface ApiResponse<T> {
  api_version: string;
  success: boolean;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorResponse {
  api_version: string;
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
}

// Location types
export interface Location {
  id: number;
  city_id: number;
  area: string;
  street?: string;
  building_number?: string;
  floor_number?: string;
  apartment_number?: string;
  latitude?: number;
  longitude?: number;
  additional_directions?: string;
}

// City types
export interface City {
  id: number;
  name: string;
  slug: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
}

// Attribute types
export interface Attribute {
  id: number;
  name: string;
  slug: string;
}

export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  attribute?: Attribute;
}

// Shop types
export interface Shop {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location?: Location;
  whatsapp_number?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: number;
  shop_id: number;
  subcategory_id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock_quantity: number;
  discount_type?: 'percent' | 'amount';
  discount_value?: number;
  discounted_price?: number;
  is_active: boolean;
  images?: ProductImage[];
  attribute_values?: AttributeValue[];
  shop?: Shop;
  subcategory?: Subcategory;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
}

// Offer types (products with discounts)
export interface Offer extends Product {
  discount_percentage?: number;
}

// Ad Carousel types
export interface AdCarousel {
  id: number;
  title: string;
  image_url?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
}

// Search Suggestion types
export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  price?: number;
  image?: string;
}

export interface SearchSuggestionsResponse {
  query: string;
  type: 'products' | 'shops';
  suggestions: SearchSuggestion[];
}

// Product Stats types
export interface ProductStats {
  product_id: number;
  views_count: number;
  whatsapp_clicks_count: number;
  location_clicks_count: number;
  favorites_count: number;
}

// Filter types for API requests
export interface ProductFilters {
  search?: string;
  shop_id?: number;
  category_id?: number;
  subcategory_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_discount?: boolean;
  attributes?: Record<string, number[]>;
  city_id?: number;
  area?: string;
  near?: {
    lat: number;
    lng: number;
    radius: number;
  };
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface ShopFilters {
  search?: string;
  city_id?: number;
  area?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

// Legacy types for backward compatibility (will be removed)
export type CategoryType = 'clothes' | 'shoes' | 'accessories' | 'cosmetics' | 'toys' | 'phones' | 'laptops';
