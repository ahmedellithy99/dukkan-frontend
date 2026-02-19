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

// Media Resource type (Laravel Media Library)
export interface MediaResource {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  large_url: string;
  thumb_url: string;
}

// Location types
export interface Location {
  id: number;
  area: string;
  full_address: string;
  latitude: number;
  longitude: number;
  created_at?: string; 
  updated_at?: string;
  city?: City; 
}

export interface Governorate {
  id: number;
  name: string;
  slug: string;
}

// City types
export interface City {
  id: number;
  name: string;
  slug: string;
  governorate?: Governorate;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string; 
  updated_at?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id?: number;
  name: string;
  slug: string;
  category?: Category;
}

// Attribute types
export interface Attribute {
  id: number;
  name: string;
  slug: string;
  attribute_values?: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  slug: string;
  value: string;
  attribute?: Attribute;
}

// Shop types
export interface Shop {
  id: number;
  slug: string;
  name: string;
  description?: string;
  whatsapp_number?: string;
  phone_number?: string;
  location?: Location;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  products_count?: number;
  products?: Product[]; 
  logo?: MediaResource; 
  media_count?: number; 
}

// Product types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount_type?: "percent" | "amount";
  discount_value?: number;
  discounted_price?: number; // Only when has discount
  savings_amount?: number; // Only when has discount
  stock_quantity?: number; // Only in vendor endpoint
  is_active?: boolean; // Only in vendor endpoint
  is_in_stock?: boolean; // Only in vendor endpoint
  is_low_stock?: boolean; // Only in vendor endpoint
  has_discount: boolean;
  created_at?: string; // Only in vendor endpoint
  updated_at?: string; // Only in vendor endpoint
  shop?: Shop; // Loaded when included
  subcategory?: Subcategory; // Loaded when included
  attribute_values?: AttributeValue[]; // Loaded when included
  stats?: ProductStats; // Loaded when included (vendor only)
  main_image?: MediaResource[]; // Loaded when included
  secondary_image?: MediaResource[]; // Loaded when included
}

// Ad Carousel types
export interface AdCarousel {
  id: number;
  title?: string; // Only in admin endpoint
  carousel_image?: MediaResource;
  link_url?: string;
  display_order: number;
}

// Search Suggestion types
export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  price?: number; // Only for products
  image?: string; // Thumbnail URL
}

export interface SearchSuggestionsResponse {
  query: string;
  type: "products" | "shops";
  suggestions: SearchSuggestion[];
}

// Full Search Response types
export interface SearchResponse {
  query: string;
  type: "products" | "shops";
  results: {
    products?: {
      data: Product[];
      total: number;
      has_more: boolean;
    };
    shops?: {
      data: Shop[];
      total: number;
      has_more: boolean;
    };
  };
}

// Product Stats types
export interface ProductStats {
  product_id: number;
  views_count: number;
  whatsapp_clicks: number;
  location_clicks: number;
  favorites_count: number;
  last_viewed_at?: string; // ISO 8601 string
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
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
  is_active?: boolean;
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

// Vendor Authentication types
export interface VendorAuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  };
  token: string;
  token_type: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  total_views: number;
  total_whatsapp_clicks: number;
  total_location_clicks: number;
  total_favorites: number;
  engagement_rate: number;
  trends: {
    views_change: number;
    whatsapp_change: number;
    location_change: number;
    favorites_change: number;
  };
}

// Recent Activity
export interface Activity {
  id: number;
  activity_type: "view" | "whatsapp_click" | "location_click" | "favorite";
  created_at: string;
  created_at_human: string;
  product: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RecentActivityResponse {
  activities: Activity[];
  timeframe_days: number;
  count: number;
}

// Product Form Data
export interface ProductFormData {
  subcategory_id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  attribute_values?: number[];
  discount_type?: "percent" | "amount";
  discount_value?: number;
}

// Shop Form Data
export interface ShopFormData {
  location_id: number;
  name: string;
  description?: string;
  whatsapp_number?: string;
  phone_number?: string;
  is_active: boolean;
}

// Legacy types for backward compatibility (will be removed)
export type CategoryType =
  | "clothes"
  | "shoes"
  | "accessories"
  | "cosmetics"
  | "toys"
  | "phones"
  | "laptops";
